export type AccountType = 'LDAP' | 'Локальная';
export type AccountId = string;

export interface LabelObj {
  text: string;
}

export interface AccountAttributes {
  labels: LabelObj[];
  type: AccountType;
  login: string;
  password: string | null;
}

export interface Account extends AccountAttributes {
  id: AccountId;
}

export type AccountLike = AccountAttributes & { id?: AccountId };

export interface AccountRowModel {
  id: AccountId;
  labelsInput: string;
  type: AccountType;
  login: string;
  password: string | null;
}
