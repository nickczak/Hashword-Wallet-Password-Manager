export interface VaultField {
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface VaultEntry {
  name: string;
  fields: VaultField[];
}

function passwordEntry(name: string, username: string, website: string): VaultEntry {
  return {
    name,
    fields: [
      { label: "Username", value: username },
      { label: "Email", value: "alex@example.com" },
      { label: "Password", value: "example-only", sensitive: true },
      { label: "Website", value: website },
      { label: "One-time password secret", value: "", sensitive: true },
      { label: "Recovery codes", value: "", sensitive: true },
      { label: "Notes", value: "", sensitive: true },
    ],
  };
}

function walletEntry(name: string): VaultEntry {
  return {
    name,
    fields: [
      { label: "Network", value: "Example network" },
      { label: "Public address", value: "0x0000...example" },
      { label: "Wallet type", value: "Hardware wallet" },
      { label: "Private key", value: "example-only-not-a-real-key", sensitive: true },
      { label: "Recovery phrase", value: "example only — not a real recovery phrase", sensitive: true },
      { label: "Passphrase", value: "", sensitive: true },
      { label: "PIN", value: "", sensitive: true },
      { label: "Derivation path", value: "" },
      { label: "Notes", value: "", sensitive: true },
    ],
  };
}

export const initialEntries: Record<string, VaultEntry[]> = {
  passwords: [
    passwordEntry("Example email account", "alex@example.com", "https://example.com"),
    passwordEntry("Example source control login", "alex-dev", "https://code.example.com"),
    passwordEntry("Example banking login", "alex-example", "https://bank.example.com"),
  ],
  wallets: [walletEntry("Example primary wallet"), walletEntry("Example savings wallet")],
};
