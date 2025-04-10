<script setup lang="ts">
import FormSuratInternal from '~/components/form/SuratInternal.vue'

const props = defineProps<{
  selectedData: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()
</script>


<template>
  <UModal v-bind="$attrs" prevent-close :ui="{ width: 'w-full sm:max-w-lg md:max-w-2xl' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Tambah Surat Internal
          </h3>

          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>

      <FormSuratInternal
        :selectedData="props.selectedData"
      
        @refreshTable="emit('refresh')" 
        @closeModal="emit('close')"
      />
    </UCard>
  </UModal>
</template>