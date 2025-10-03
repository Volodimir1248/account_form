import type {
  Account,
  AccountId,
  AccountLike,
  AccountRowModel,
  AccountType,
  LabelObj,
} from '../types';

export const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['Локальная', 'LDAP'];
export const LABEL_SEPARATOR = ';';
export const LABEL_MAX_LENGTH = 50;
export const LOGIN_MAX_LENGTH = 100;

let accountIdCounter = 0;

export function createAccountId(): AccountId {
  accountIdCounter += 1;
  return `acc-${Date.now()}-${accountIdCounter}`;
}

export function ensureAccountHasId(account: AccountLike): Account {
  if (account.id) {
    return account as Account;
  }

  return {
    ...account,
    id: createAccountId(),
  };
}

export function parseLabelsInput(input: string): LabelObj[] {
  return input
    .split(LABEL_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

export function formatLabels(labels: LabelObj[]): string {
  return labels.map((label) => label.text).join(`${LABEL_SEPARATOR} `);
}

export function toAccount(row: AccountRowModel): Account {
  return {
    id: row.id,
    labels: parseLabelsInput(row.labelsInput),
    type: row.type,
    login: row.login,
    password: row.type === 'LDAP' ? null : row.password ?? '',
  };
}

export function fromAccount(account: AccountLike): AccountRowModel {
  const normalized = ensureAccountHasId(account);

  return {
    id: normalized.id,
    labelsInput: formatLabels(normalized.labels),
    type: normalized.type,
    login: normalized.login,
    password: normalized.password ?? null,
  };
}

export function createEmptyRow(): AccountRowModel {
  return {
    id: createAccountId(),
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
