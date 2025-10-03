import { defineStore } from 'pinia';
import type { Account, AccountId, AccountLike } from '../types';
import { ensureAccountHasId } from '../utils/account';

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as (AccountLike | null)[],
  }),
  actions: {
    ensureAllHaveIds(): Account[] {
      const normalized = this.accounts
        .filter((account): account is AccountLike => account != null)
        .map((account) => ensureAccountHasId(account));

      if (
        normalized.length !== this.accounts.length ||
        normalized.some((account, index) => account !== this.accounts[index])
      ) {
        this.accounts = normalized;
      }

      return normalized;
    },
    setAll(next: AccountLike[]) {
      this.accounts = next.map((account) => ensureAccountHasId(account));
    },
    save(account: AccountLike) {
      const existing = this.ensureAllHaveIds();
      const normalized = ensureAccountHasId(account);
      const index = existing.findIndex((item) => item.id === normalized.id);

      if (index >= 0) {
        const next = existing.slice();
        next[index] = normalized;

        this.accounts = next;
        return;
      }

      this.accounts = [...existing, normalized];
    },
    remove(id: AccountId) {
      const existing = this.ensureAllHaveIds();
      const next = existing.filter((account) => account.id !== id);

      if (next.length !== existing.length) {
        this.accounts = next;
      }
    },
  },
  persist: {
    key: 'accounts',
    pick: ['accounts'],
  },
});
