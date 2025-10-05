export type AccountType = 'LDAP' | 'Локальная';
export type AccountTs = string;

export interface LabelObj {
  text: string;
}

export interface Account {
  ts: AccountTs;
  labels: LabelObj[];
  type: AccountType;
  login: string;
  password: string | null;
}

export interface AccountRowModel {
  ts: AccountTs;
  labelsInput: string;
  type: AccountType;
  login: string;
  password: string | null;
}
