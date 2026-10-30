import React from "react";
import { readFileSync } from "node:fs";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import LoginPage from "./LoginPage.js";
import VaultPage from "./VaultPage.js";
import { createEmptyVault } from "./vaultData.js";

const banner = readFileSync(
  new URL("../../public/assets/banner.txt", import.meta.url),
  "utf8",
).trimEnd();

const green = "#39FF14";
// Fail closed until vault encryption and master-key verification are connected.
const verifyMasterKey = () => false;

export default function App() {
  const { columns, rows } = useWindowSize();
  const { exit } = useApp();
  const [unlocked, setUnlocked] = React.useState(false);
  const [section, setSection] = React.useState("passwords");
  const [loginMessage, setLoginMessage] = React.useState("");
  const [enteredPassword, setEnteredPassword] = React.useState("");
  const [entriesBySection, setEntriesBySection] = React.useState(createEmptyVault);
  const [editing, setEditing] = React.useState(false);
  const [prompting, setPrompting] = React.useState(false);

  const handlePasswordSubmit = () => {
    setLoginMessage("Vault unlocking is unavailable until authentication and encryption are connected.");
    setEnteredPassword("");
  };

  /** KEY BINDINGS
   *  enter - submit password
   *  enter - open entry details (only when unlocked)
   *  esc - return to entries (only when unlocked)
   *  ctrl+l - lock the vault (only when unlocked)
   *  ctrl+q - quit
   *  p - switch to passwords (only when unlocked)
   *  w - switch to wallets (only when unlocked)
   *  a - switch to account (only when unlocked)
   */
  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === "q") {
      exit();
      return;
    }

    if (unlocked) {
      if (key.ctrl && input.toLowerCase() === "l") {
        setEditing(false);
        setPrompting(false);
        setUnlocked(false);
        setEntriesBySection(createEmptyVault());
        return;
      }
      if (editing || prompting || key.ctrl || key.meta) return;
      if (input.toLowerCase() === "p") setSection("passwords");
      if (input.toLowerCase() === "w") setSection("wallets");
      if (input.toLowerCase() === "a") setSection("account");
      return;
    }

    if (key.return) {
      handlePasswordSubmit();
    } else if (key.backspace || key.delete) {
      setEnteredPassword((password) => password.slice(0, -1));
    } else if (!key.ctrl && !key.meta && input && /^[\x20-\x7e]+$/.test(input)) {
      setEnteredPassword((password) => password + input);
    }
  });

  // Calculate layout dimensions based on terminal size
  const padding = columns < 70 ? 2 : 4;
  const contentWidth = Math.max(1, columns - padding * 2);

  return (
    <Box
      flexDirection="column"
      width={columns}
      height={rows}
      paddingX={padding}
      paddingY={0}
    >
      <Box justifyContent="space-between">
        <Text bold color={green}>hashword</Text>
        <Text color={unlocked ? green : "gray"}>
          {unlocked ? "unlocked" : "locked"}
        </Text>
      </Box>
      <Text dimColor>{"─".repeat(contentWidth)}</Text>

      <Box justifyContent="center" gap={1}>
        {["passwords", "wallets", "account"].map((tab) => (
          <Box key={tab} borderStyle="single" borderColor={unlocked && section === tab ? green : "gray"} paddingX={1}>
            <Text color={unlocked && section === tab ? green : "gray"}>
              {unlocked ? tab[0] : "🔒"} {tab}
            </Text>
          </Box>
        ))}
      </Box>

      {unlocked ? (
        <VaultPage
          key={section}
          section={section}
          entries={entriesBySection[section] ?? []}
          onEditingChange={setEditing}
          onPromptChange={setPrompting}
          verifyMasterKey={verifyMasterKey}
          onFieldSave={(entryIndex, fieldIndex, value) => {
            setEntriesBySection((current) => ({
              ...current,
              [section]: (current[section] ?? []).map((entry, index) => index === entryIndex ? {
                ...entry,
                fields: entry.fields.map((field, index) => index === fieldIndex ? { ...field, value } : field),
              } : entry),
            }));
          }}
        />
      ) : (
        <LoginPage
          banner={banner}
          showBanner={contentWidth >= 58 && rows >= 24}
          enteredPassword={enteredPassword}
          message={loginMessage}
        />
      )}

      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box gap={3}>
        {unlocked && <Text dimColor>{prompting ? "enter confirm · esc cancel" : editing ? "enter save · esc cancel" : "j/k or ↑/↓ move · enter open/reveal · i edit · esc back"}</Text>}
        {!unlocked && <Text><Text color={green}>enter</Text><Text dimColor> submit</Text></Text>}
        {unlocked && <Text><Text color={green}>ctrl+l</Text><Text dimColor> lock</Text></Text>}
        <Text><Text color={green}>ctrl+q</Text><Text dimColor> quit</Text></Text>
      </Box>
    </Box>
  );
}
