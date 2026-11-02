import React from "react";
import { readFileSync } from "node:fs";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import * as api from "../lib/api.js";
import type { Account } from "../lib/api.js";
import LoginPage, { type LoginField } from "./LoginPage.js";

const banner = readFileSync(
  new URL("../../public/assets/banner.txt", import.meta.url),
  "utf8",
).trimEnd();
const green = "#39FF14";

export default function App() {
  const { columns, rows } = useWindowSize();
  const { exit } = useApp();
  const [message, setMessage] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [field, setField] = React.useState<LoginField>("username");
  const fields: LoginField[] = creating ? ["username", "email", "password"] : ["username", "password"];
  const [account, setAccount] = React.useState<Account | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    if (loading) return;
    if (!username.trim() || !password || (creating && !email.trim())) {
      setMessage("Complete all fields before submitting.");
      return;
    }
    if (creating && password.length < 12) {
      setMessage("Use an account password with at least 12 characters.");
      return;
    }
    setLoading(true);
    setMessage(creating ? "Creating account…" : "Signing in…");
    const submittedPassword = password;
    setPassword("");
    try {
      const result = creating
        ? await api.register({ name: username.trim(), username: username.trim(), email: email.trim(), password: submittedPassword })
        : await api.login(username.trim(), submittedPassword);
      setAccount(result);
      setMessage("");
    } catch {
      setMessage(creating ? "Unable to register. Check your details, username availability, and connection." : "Unable to sign in. Check your credentials and connection.");
    } finally { setLoading(false); }
  }

  async function signOut() {
    setLoading(true);
    setAccount(null);
    setPassword("");
    setMessage("Signing out…");
    try {
      await api.logout();
      setMessage("");
    } catch {
      setMessage("Local session cleared. Server sign-out failed; the session will expire automatically.");
    } finally { setLoading(false); }
  }

  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === "q") { exit(); return; }
    if (loading) return;
    if (account) {
      if (input.toLowerCase() === "l") void signOut();
      return;
    }
    if (key.ctrl && input.toLowerCase() === "r") {
      setCreating((value) => !value);
      setField("username");
      setPassword("");
      setMessage("");
    } else if (key.tab || key.upArrow || key.downArrow) {
      const direction = key.upArrow || (key.tab && key.shift) ? -1 : 1;
      setField(fields[(fields.indexOf(field) + direction + fields.length) % fields.length]);
    } else if (key.return) {
      if (field !== "password") setField(fields[fields.indexOf(field) + 1]);
      else void submit();
    } else if (key.backspace || key.delete) {
      const update = (value: string) => Array.from(value).slice(0, -1).join("");
      if (field === "username") setUsername(update);
      else if (field === "email") setEmail(update);
      else setPassword(update);
    } else if (!key.ctrl && !key.meta && input && !/[\x00-\x1f\x7f]/.test(input)) {
      if (field === "username") setUsername((value) => value + input);
      else if (field === "email") setEmail((value) => value + input);
      else setPassword((value) => value + input);
    }
  });

  const padding = columns < 70 ? 2 : 4;
  const contentWidth = Math.max(1, columns - padding * 2);

  return (
    <Box flexDirection="column" width={columns} height={rows} paddingX={padding}>
      <Box justifyContent="space-between">
        <Text bold color={green}>hashword</Text>
        <Text color="gray">{account ? "signed in" : "signed out"}</Text>
      </Box>
      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box justifyContent="center" gap={1}>
        {["passwords", "wallets", "account"].map((tab) => (
          <Box key={tab} borderStyle="single" borderColor="gray" paddingX={1}>
            <Text color="gray">{account ? "" : "🔒 "}{tab}</Text>
          </Box>
        ))}
      </Box>
      {account ? (
        <Box flexGrow={1} flexDirection="column" alignItems="center" justifyContent="center">
          <Text color={green}>{account.name}'s vault</Text>
          <Text dimColor>Vault storage is not available yet.</Text>
          <Text dimColor>Press L to sign out.</Text>
        </Box>
      ) : <LoginPage
        banner={banner}
        showBanner={contentWidth >= 58 && rows >= (creating ? 29 : 24)}
        enteredPassword={password}
        username={username}
        email={email}
        creating={creating}
        loading={loading}
        field={field}
        message={message}
      />}
      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box gap={3}>
        <Text><Text color={green}>enter</Text><Text dimColor> {account ? "" : "submit / tab to switch fields"}</Text></Text>
        <Text><Text color={green}>ctrl+q</Text><Text dimColor> quit</Text></Text>
      </Box>
    </Box>
  );
}
