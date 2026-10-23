import React from "react";
import { readFileSync } from "node:fs";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";

const banner = readFileSync(
  new URL("../../public/assets/banner.txt", import.meta.url),
  "utf8",
).trimEnd();

const green = "#39FF14";

export default function App() {
  const { columns, rows } = useWindowSize();
  const { exit } = useApp();
  const [unlocked, setUnlocked] = React.useState(false);
  const [section, setSection] = React.useState("passwords");
  const [enteredPassword, setEnteredPassword] = React.useState("");

  const handlePasswordSubmit = () => {
    // For demonstration purposes, the preview password is "password".
    setUnlocked(enteredPassword === "password");
    setEnteredPassword("");
  };

  /** KEY BINDINGS
   *  enter - submit password or lock the preview
   *  q - quit
   *  p - switch to passwords (only when unlocked)
   *  w - switch to wallets (only when unlocked)
   */
  useInput((input, key) => {
    if (input.toLowerCase() === "q") {
      exit();
      return;
    }

    if (unlocked) {
      if (key.return) setUnlocked(false);
      if (input.toLowerCase() === "p") setSection("passwords");
      if (input.toLowerCase() === "w") setSection("wallets");
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
  const sidebarWidth = Math.min(24, Math.floor(contentWidth / 3));
  const mainWidth = unlocked ? contentWidth - sidebarWidth : contentWidth;

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
        {["passwords", "wallets"].map((tab) => (
          <Box key={tab} borderStyle="single" borderColor={unlocked && section === tab ? green : "gray"} paddingX={1}>
            <Text color={unlocked && section === tab ? green : "gray"}>
              {unlocked ? tab[0] : "🔒"} {tab}
            </Text>
          </Box>
        ))}
      </Box>

      <Box flexGrow={1}>
        {unlocked && (
          <Box width={sidebarWidth} flexShrink={0} flexDirection="column" paddingRight={1} paddingY={1} borderStyle="single" borderColor="gray" borderTop={false} borderBottom={false} borderLeft={false}>
            <Text bold color={green}>vault info</Text>
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>status</Text>
              <Text color={green}>unlocked</Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>view</Text>
              <Text>{section}</Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>mode</Text>
              <Text>preview</Text>
            </Box>
            <Box marginTop={1}><Text dimColor>Enter to lock.</Text></Box>
          </Box>
        )}
        <Box flexGrow={1} flexBasis={0} flexDirection="column" alignItems="center" justifyContent="center" paddingX={1}>
          {mainWidth >= 58 && rows >= 24 && (
            <Box marginBottom={1.5}>
              <Text color={green}>{banner}</Text>
            </Box>
          )}
          <Text dimColor>wallet & password manager</Text>

          {!unlocked && (
            <Box marginTop={2} width={40} borderStyle="single" borderColor="gray" paddingX={1}>
              <Box width={10} flexShrink={0}><Text color={green}>Password:</Text></Box>
              <Box width={26} flexShrink={0}>
                {enteredPassword ? (
                  <Text color={green}>{"•".repeat(Math.min(enteredPassword.length, 26))}</Text>
                ) : (
                  <Text dimColor>Enter password...</Text>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Text dimColor>{"─".repeat(contentWidth)}</Text>
      <Box gap={3}>
        {unlocked && <Text dimColor>p passwords / w wallets</Text>}
        <Text><Text color={green}>enter</Text><Text dimColor>{unlocked ? " lock" : " open preview"}</Text></Text>
        <Text><Text color={green}>q</Text><Text dimColor> quit</Text></Text>
      </Box>
    </Box>
  );
}
