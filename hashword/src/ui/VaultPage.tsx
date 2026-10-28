import React from "react";
import { Box, Text, useInput } from "ink";

interface VaultPageProps {
  section: string;
}

const entriesBySection: Record<string, { name: string; details: string[] }[]> = {
  passwords: [
    { name: "Example email account", details: ["username: alex@example.com", "password: example-only"] },
    { name: "Example source control login", details: ["username: alex-dev", "password: example-only"] },
    { name: "Example banking login", details: ["username: alex-example", "password: example-only"] },
  ],
  wallets: [
    { name: "Example primary wallet", details: ["network: example network", "address: 0x0000...example"] },
    { name: "Example savings wallet", details: ["network: example network", "address: 0x0000...example"] },
  ],
};

export default function VaultPage({ section }: VaultPageProps) {
  const entries = entriesBySection[section] ?? [];
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [focusedColumn, setFocusedColumn] = React.useState<"entries" | "details">("entries");
  const [selectedDetailIndex, setSelectedDetailIndex] = React.useState(0);
  const selectedEntry = entries[selectedIndex];

  useInput((input, key) => {
    if (key.ctrl || key.meta) return;
    if ((key.return || key.rightArrow) && selectedEntry) {
      setFocusedColumn("details");
      return;
    }
    if (key.escape || key.leftArrow) {
      setFocusedColumn("entries");
      return;
    }
    const direction = input.toLowerCase() === "j" || key.downArrow ? 1
      : input.toLowerCase() === "k" || key.upArrow ? -1 : 0;
    if (direction && focusedColumn === "entries") {
      setSelectedIndex((index) => Math.max(0, Math.min(index + direction, entries.length - 1)));
      setSelectedDetailIndex(0);
    } else if (direction && selectedEntry) {
      setSelectedDetailIndex((index) => Math.max(0, Math.min(index + direction, selectedEntry.details.length - 1)));
    }
  });

  return (
    <Box flexGrow={1} flexDirection="row" paddingX={2} paddingY={1}>
      <Box width={32} flexShrink={0} flexDirection="column" paddingRight={1} borderStyle="single" borderColor="gray" borderTop={false} borderBottom={false} borderLeft={false}>
        <Text bold color="#39FF14">{section}</Text>
        <Box marginTop={1} flexDirection="column">
          {entries.map((entry, index) => (
            <Text key={entry.name} color={index === selectedIndex ? "#39FF14" : undefined} bold={index === selectedIndex}>
              {focusedColumn === "entries" && index === selectedIndex ? "> " : "  "}{entry.name}
            </Text>
          ))}
        </Box>
      </Box>
      <Box flexGrow={1} flexDirection="column" paddingLeft={2}>
        {selectedEntry ? (
          <>
            <Text bold color="#39FF14">{selectedEntry.name}</Text>
            <Box marginTop={1} flexDirection="column">
              {selectedEntry.details.map((detail, index) => (
                <Text key={detail} color={focusedColumn === "details" && index === selectedDetailIndex ? "#39FF14" : undefined}>
                  {focusedColumn === "details" && index === selectedDetailIndex ? "> " : "  "}{detail}
                </Text>
              ))}
            </Box>
          </>
        ) : (
          <Text dimColor>No entries in this section.</Text>
        )}
      </Box>
    </Box>
  );
}
