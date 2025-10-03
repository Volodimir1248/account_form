<template>
  <main class="app-shell">
    <AccountsForm />
  </main>
</template>

<script setup lang="ts">
import AccountsForm from './components/AccountsForm.vue';
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2.5rem) clamp(1rem, 4vw, 3.5rem);
}
</style>
