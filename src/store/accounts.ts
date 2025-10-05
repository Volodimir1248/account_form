import { defineStore } from 'pinia';
import type { Account, AccountTs } from '../types';

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
  }),
  actions: {
    save(account: Account) {
      const index = this.accounts.findIndex((item) => item.ts === account.ts);

      if (index >= 0) {
        const next = this.accounts.slice();
        next[index] = account;

        this.accounts = next;
        return;
      }

      this.accounts = [...this.accounts, account];
    },
    remove(ts: AccountTs) {
      const filteredAccounts = this.accounts.filter((account) => account.ts !== ts);

      if (filteredAccounts.length !== this.accounts.length) {
        this.accounts = filteredAccounts;
      }
    },
  },
  persist: {
    key: 'accounts',
    pick: ['accounts'],
  },
});
