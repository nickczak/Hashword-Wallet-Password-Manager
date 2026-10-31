import React from "react";
import { readFileSync } from "node:fs";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import LoginPage from "./LoginPage.js";

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

  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === "q") {
      exit();
    } else if (key.return) {
      setMessage("Vault unlocking is unavailable until authentication and encryption are connected.");
      setPassword("");
    } else if (key.backspace || key.delete) {
      setPassword((value) => Array.from(value).slice(0, -1).join(""));
    } else if (!key.ctrl && !key.meta && input && /^[\x20-\x7e]+$/.test(input)) {
      setPassword((value) => value + input);
    }
  });

  const padding = columns < 70 ? 2 : 4;
  const contentWidth = Math.max(1, columns - padding * 2);

  return (
    <Box flexDirection="column" width={columns} height={rows} paddingX={padding}>
      <Box justifyContent="space-between">
        <Text bold color={green}>hashword</Text>
        <Text color="gray">locked</Text>
      </Box>
      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box justifyContent="center" gap={1}>
        {["passwords", "wallets", "account"].map((tab) => (
          <Box key={tab} borderStyle="single" borderColor="gray" paddingX={1}>
            <Text color="gray">🔒 {tab}</Text>
          </Box>
        ))}
      </Box>
      <LoginPage
        banner={banner}
        showBanner={contentWidth >= 58 && rows >= 24}
        enteredPassword={password}
        message={message}
      />
      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box gap={3}>
        <Text><Text color={green}>enter</Text><Text dimColor> submit</Text></Text>
        <Text><Text color={green}>ctrl+q</Text><Text dimColor> quit</Text></Text>
      </Box>
    </Box>
  );
}
