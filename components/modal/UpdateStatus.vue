<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-tag-starred" color="lime" size="xs" square variant="soft" />
            <h1 class="text-lg">Update Status Surat</h1>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
// TODO : Tambahkan logic untuk menampilkan data surat yang dipilih dan mengupdate status surat
</script>