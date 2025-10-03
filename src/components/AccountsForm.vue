<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';

import { useAccountsStore } from '../store/accounts';
import type { AccountRowModel } from '../types';
import {
  ACCOUNT_TYPE_OPTIONS,
  LOGIN_MAX_LENGTH,
  LABEL_MAX_LENGTH,
  createEmptyRow,
  ensurePasswordForType,
  fromAccount,
  isLdap,
  toAccount,
} from '../utils/account';

const store = useAccountsStore();

const rows = reactive<AccountRowModel[]>([]);
const formRefs = ref<FormInstance[]>([]);

const typeOptions = ACCOUNT_TYPE_OPTIONS;
const hasMultipleRows = computed(() => rows.length > 1);

function registerFormRef(index: number) {
  return (instance: FormInstance | null) => {
    if (instance) {
      formRefs.value[index] = instance;
    } else {
      formRefs.value.splice(index, 1);
    }
  };
}

function showSuccess(message: string) {
  ElMessage.success(message);
}

function createValidationRules(row: AccountRowModel): FormRules {
  return {
    labelsInput: [
      {
        validator: (_rule, value: string, callback) => {
          if (value && value.length > LABEL_MAX_LENGTH) {
            callback(new Error(`Максимум ${LABEL_MAX_LENGTH} символов`));
            return;
          }

          callback();
        },
        trigger: 'blur',
      },
    ],
    type: [{ required: true, message: 'Выберите тип', trigger: 'change' }],
    login: [
      { required: true, message: 'Логин обязателен', trigger: 'blur' },
      { max: LOGIN_MAX_LENGTH, message: `Максимум ${LOGIN_MAX_LENGTH} символов`, trigger: 'blur' },
    ],
    password: [
      {
        validator: (_rule, value: string | null, callback) => {
          if (!isLdap(row.type)) {
            if (!value || value === '') {
              callback(new Error('Пароль обязателен'));
              return;
            }

            if (String(value).length > LOGIN_MAX_LENGTH) {
              callback(new Error(`Максимум ${LOGIN_MAX_LENGTH} символов`));
              return;
            }
          }

          callback();
        },
        trigger: 'blur',
      },
    ],
  };
}

function validateAndSave(index: number) {
  const form = formRefs.value[index];
  const row = rows[index];
  if (!form || !row) return;

  form.validate((valid) => {
    if (valid) {
      store.save(toAccount(row));
      showSuccess('Запись сохранена');
    }
  });
}

function addRow() {
  rows.push(createEmptyRow());
  nextTick(() => showSuccess('Добавлена новая запись'));
}

function removeRow(index: number) {
  const row = rows[index];
  if (!row) return;

  const rowId = row.id;
  rows.splice(index, 1);
  formRefs.value.splice(index, 1);

  store.remove(rowId);
}

function handleTypeChange(index: number) {
  const row = rows[index];
  if (!row) return;

  row.password = ensurePasswordForType(row.type, row.password);
  validateAndSave(index);
}

function initializeRows() {
  const storedAccounts = store.ensureAllHaveIds();

  if (storedAccounts.length) {
    const restored = storedAccounts.map((acc) => fromAccount(acc));
    formRefs.value = [];
    rows.splice(0, rows.length, ...restored);
    return;
  }

  formRefs.value = [];
  rows.splice(0, rows.length, createEmptyRow());
}

onMounted(() => {
  initializeRows();
});
</script>

<template>
  <section class="accounts-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Учетные записи</h1>
      </div>
      <div class="page-button">
        <el-button type="primary" :icon="Plus" circle class="add-button" @click="addRow" />
      </div>
    </header>

    <el-alert
      class="hint"
      type="info"
      :closable="false"
      description="Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;"
      show-icon
    />

    <div class="accounts-table">
      <div class="table-head">
        <div class="table-row table-row--head">
          <span class="table-cell table-cell--labels">Метки</span>
          <span class="table-cell table-cell--type">Тип записи</span>
          <span class="table-cell table-cell--login">Логин</span>
          <span class="table-cell table-cell--password">Пароль</span>
        </div>
      </div>

      <div class="table-body">
        <el-form
          v-for="(row, idx) in rows"
          :key="row.id"
          :model="row"
          :rules="createValidationRules(row)"
          status-icon
          :ref="registerFormRef(idx)"
          class="account-form table-row"
          label-width="0"
        >
          <div class="table-row__header">
            <span class="table-row__title">Запись №{{ idx + 1 }}</span>
            <el-button
              v-if="hasMultipleRows"
              type="danger"
              circle
              :icon="Delete"
              @click="removeRow(idx)"
              aria-label="Удалить учетную запись"
              class="row-remove"
            />
          </div>

          <el-form-item class="table-cell table-cell--labels" data-label="Метки" prop="labelsInput">
            <el-input
              v-model="row.labelsInput"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="XXX; YYYYY; ZZZZ"
              @blur="validateAndSave(idx)"
            />
          </el-form-item>

          <el-form-item class="table-cell table-cell--type" data-label="Тип записи" prop="type">
            <el-select v-model="row.type" placeholder="Выберите тип" @change="handleTypeChange(idx)">
              <el-option v-for="opt in typeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>

          <el-form-item class="table-cell table-cell--login" data-label="Логин" prop="login">
            <el-input v-model="row.login" placeholder="Логин" @blur="validateAndSave(idx)" />
          </el-form-item>

          <el-form-item class="table-cell table-cell--password" data-label="Пароль" prop="password">
            <el-input
              v-model="row.password"
              type="password"
              show-password
              placeholder="Пароль"
              v-show="!isLdap(row.type)"
              @blur="() => !isLdap(row.type) && validateAndSave(idx)"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </section>
</template>

<style scoped src="./AccountsForm.css"></style>
