import React from "react";
import { Box, Text, useInput, useWindowSize } from "ink";

import type { VaultEntry } from "./vaultData.js";

interface VaultPageProps {
  section: string;
  entries: VaultEntry[];
  onFieldSave: (entryIndex: number, fieldIndex: number, value: string) => void;
  onEditingChange: (editing: boolean) => void;
  onPromptChange: (prompting: boolean) => void;
  verifyMasterKey: (value: string) => boolean;
}

export default function VaultPage({ section, entries, onFieldSave, onEditingChange, onPromptChange, verifyMasterKey }: VaultPageProps) {
  const { rows } = useWindowSize();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [focusedColumn, setFocusedColumn] = React.useState<"entries" | "details">("entries");
  const [selectedDetailIndex, setSelectedDetailIndex] = React.useState(0);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [prompting, setPrompting] = React.useState(false);
  const [promptAction, setPromptAction] = React.useState<"reveal" | "edit">("reveal");
  const [masterKey, setMasterKey] = React.useState("");
  const [promptError, setPromptError] = React.useState(false);
  const selectedEntry = entries[selectedIndex];
  const selectedField = selectedEntry?.fields[selectedDetailIndex];
  const visibleFieldCount = Math.max(1, Math.floor((rows - 17) / 3));
  const fieldCount = selectedEntry?.fields.length ?? 0;
  const firstVisibleField = Math.min(
    Math.max(0, selectedDetailIndex - visibleFieldCount + 1),
    Math.max(0, fieldCount - visibleFieldCount),
  );

  const finishEditing = () => {
    setEditing(false);
    setDraft("");
    setRevealed(false);
    onEditingChange(false);
  };

  useInput((input, key) => {
    if (key.ctrl || key.meta) return;
    if (prompting) {
      if (key.escape) {
        setPrompting(false);
        setMasterKey("");
        setPromptError(false);
        onPromptChange(false);
      } else if (key.return) {
        if (verifyMasterKey(masterKey)) {
          if (promptAction === "edit" && selectedField) {
            setDraft(selectedField.value);
            setEditing(true);
            onEditingChange(true);
          } else {
            setRevealed(true);
          }
          setPrompting(false);
          onPromptChange(false);
          setPromptError(false);
        } else {
          setPromptError(true);
        }
        setMasterKey("");
      } else if (key.backspace || key.delete) {
        setMasterKey((value) => Array.from(value).slice(0, -1).join(""));
      } else if (input && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.tab) {
        setMasterKey((value) => value + input.replace(/[\x00-\x1f\x7f-\x9f]/g, ""));
      }
      return;
    }
    if (editing) {
      if (key.escape) {
        finishEditing();
      } else if (key.return) {
        onFieldSave(selectedIndex, selectedDetailIndex, draft);
        finishEditing();
      } else if (key.backspace || key.delete) {
        setDraft((value) => Array.from(value).slice(0, -1).join(""));
      } else if (input && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.tab) {
        setDraft((value) => value + input.replace(/[\x00-\x1f\x7f-\x9f]/g, ""));
      }
      return;
    }
    if (input === "i" && focusedColumn === "details" && selectedField) {
      setRevealed(false);
      if (selectedField.sensitive) {
        setPromptAction("edit");
        setMasterKey("");
        setPromptError(false);
        setPrompting(true);
        onPromptChange(true);
        return;
      }
      setDraft(selectedField.value);
      setEditing(true);
      onEditingChange(true);
      return;
    }
    if (key.return) {
      if (focusedColumn === "entries" && selectedEntry) {
        setFocusedColumn("details");
      } else if (selectedField?.sensitive) {
        if (revealed) {
          setRevealed(false);
        } else {
          setPromptAction("reveal");
          setMasterKey("");
          setPromptError(false);
          setPrompting(true);
          onPromptChange(true);
        }
      }
      return;
    }
    if (key.escape || key.leftArrow) {
      setRevealed(false);
      setFocusedColumn("entries");
      return;
    }
    if (key.rightArrow && selectedEntry) {
      setFocusedColumn("details");
      return;
    }
    const direction = input.toLowerCase() === "j" || key.downArrow ? 1
      : input.toLowerCase() === "k" || key.upArrow ? -1 : 0;
    if (direction) setRevealed(false);
    if (direction && focusedColumn === "entries") {
      setSelectedIndex((index) => Math.max(0, Math.min(index + direction, entries.length - 1)));
      setSelectedDetailIndex(0);
    } else if (direction && selectedEntry) {
      setSelectedDetailIndex((index) => Math.max(0, Math.min(index + direction, selectedEntry.fields.length - 1)));
    }
  });

  if (prompting) {
    return (
      <Box flexGrow={1} alignItems="center" justifyContent="center">
        <Box flexDirection="column" borderStyle="round" borderColor="#39FF14" paddingX={2} paddingY={1}>
          <Text bold color="#39FF14">{promptAction === "edit" ? "Edit" : "Reveal"} {selectedField?.label}</Text>
          <Text>Enter your master key to {promptAction === "edit" ? "edit" : "view"} this field.</Text>
          <Box marginTop={1}><Text>Master key: {"•".repeat(Array.from(masterKey).length)}▏</Text></Box>
          {promptError && <Text color="red">Incorrect master key. Try again.</Text>}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexGrow={1} flexDirection="row" gap={1} paddingY={1}>
      <Box width="40%" flexShrink={0} flexDirection="column" paddingX={1} borderColor="gray">
        <Box borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderColor="gray" paddingBottom={1}>
          <Text bold color="#39FF14">{section.charAt(0).toUpperCase() + section.slice(1)} <Text dimColor>({entries.length})</Text></Text>
        </Box>
        <Box flexShrink={0} marginTop={1} flexDirection="column">
          {entries.map((entry, index) => {
            const selected = index === selectedIndex;
            const active = focusedColumn === "entries" && selected;
            return (
              <Text key={entry.name} color={active ? "black" : selected ? "#39FF14" : undefined} backgroundColor={active ? "#39FF14" : undefined} bold={selected}>
                {selected ? "> " : "  "}{entry.name}
              </Text>
            );
          })}
        </Box>
      </Box>
      <Box flexGrow={1} minWidth={0} flexDirection="column" paddingX={1} borderColor="gray">
        {selectedEntry ? (
          <>
            <Box flexShrink={0} flexDirection="column" borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderColor="gray" paddingBottom={1}>
              <Text bold color="#39FF14">{selectedEntry.name}</Text>
              <Text dimColor>Field {selectedDetailIndex + 1} of {fieldCount}</Text>
            </Box>
            <Box flexShrink={0} marginTop={1} flexDirection="column">
              {selectedEntry.fields.slice(firstVisibleField, firstVisibleField + visibleFieldCount).map((field, offset) => {
                const index = firstVisibleField + offset;
                const active = focusedColumn === "details" && index === selectedDetailIndex;
                const isEditing = active && editing;
                const value = isEditing ? draft : field.value;
                const hidden = field.sensitive && !(active && revealed);
                const displayValue = isEditing
                  ? (field.sensitive ? "•".repeat(Array.from(value).length) : value)
                  : value ? (hidden ? "••••••••" : value) : "(empty)";
                return (
                  <Box key={field.label} flexShrink={0} flexDirection="column" borderStyle="single" borderTop={false} borderBottom={false} borderRight={false} borderColor={active ? "#39FF14" : "gray"} paddingLeft={1}>
                    <Text color={active ? "#39FF14" : "gray"} bold={active} wrap="truncate-end">{field.label}{active && editing ? " · editing" : ""}</Text>
                    <Text color={active ? "#39FF14" : undefined} dimColor={!value && !isEditing}>
                      {displayValue}{isEditing && <Text color="black" backgroundColor="#39FF14"> </Text>}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </>
        ) : (
          <Text dimColor>No entries in this section.</Text>
        )}
      </Box>
    </Box>
  );
}
