export interface VaultField {
  label: string;
  value: string;
  sensitive?: boolean;
}

export interface VaultEntry {
  name: string;
  fields: VaultField[];
}

export function createEmptyVault(): Record<string, VaultEntry[]> {
  return { passwords: [], wallets: [], account: [] };
}
