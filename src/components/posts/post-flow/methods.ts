export interface AccountSelectionProps {
  accounts: any[];
  selectedAccounts: string[];
  onSelectionChange: (accountIds: string[]) => void;
}
