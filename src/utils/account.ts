import type { Account, AccountTs, AccountRowModel, AccountType, LabelObj } from '../types';

export const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['Локальная', 'LDAP'];
export const LABEL_SEPARATOR = ';';
export const LABEL_MAX_LENGTH = 50;
export const LOGIN_MAX_LENGTH = 100;
export const PASSWORD_MAX_LENGTH = 100;

export function createAccountTs(): AccountTs {
  return `${Date.now()}`;
}

export function parseLabelsInput(input: string): LabelObj[] {
  return input
    .split(LABEL_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

export function formatLabels(labels: LabelObj[]): string {
  return labels.map((label) => label.text).join(`${LABEL_SEPARATOR}`);
}

export function toAccount(row: AccountRowModel): Account {
  return {
    ts: row.ts,
    labels: parseLabelsInput(row.labelsInput),
    type: row.type,
    login: row.login,
    password: ensurePasswordForType(row.type, row.password),
  };
}

export function fromAccount(account: Account): AccountRowModel {
  return {
    ts: account.ts,
    labelsInput: formatLabels(account.labels),
    type: account.type,
    login: account.login,
    password: ensurePasswordForType(account.type, account.password),
  };
}

export function createEmptyRow(): AccountRowModel {
  return {
    ts: createAccountTs(),
    labelsInput: '',
    type: 'Локальная',
    login: '',
    password: '',
  };
}

export function isLdap(type: AccountType): boolean {
  return type === 'LDAP';
}

export function ensurePasswordForType(type: AccountType, value: string | null): string | null {
  if (isLdap(type)) {
    return null;
  }

  if (value === null) {
    return '';
  }

  return value;
}
