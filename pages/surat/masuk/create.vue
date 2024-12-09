<template>
  <div class="flex gap-4 flex-col-reverse xl:flex-row">
    <UCard class="w-full">
      <template #header>
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-edit" color="sky" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Surat Masuk</h1>
          </div>
        </div>
      </template>

      <FormSuratMasuk />
    </UCard>
    
    <div class="xl:w-[60%] w-full">
      <UAlert
        class="w-full"
        icon="i-heroicons-exclamation-circle-16-solid"
        color="yellow"
        variant="soft"
        title="Perhatian"
        description="Pastikan data yang diinputkan sudah benar sebelum menyimpan data."
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: 'Surat Masuk -- ILM ',
  meta: [{ name: 'description', content: 'Create Surat Masuk' }],
});
</script>