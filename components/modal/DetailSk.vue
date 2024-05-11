<template>
  <UModal  v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-heroicons-eye-20-solid" color="blue" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail SK</h1>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <div>
          <p class="text-sm text-cool-400">Nomor SK</p>
          <UBadge color="gray">
            {{ [selectedSk?.nomor, selectedSk?.jenis, selectedSk?.prefix, format(new Date(selectedSk!.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/') }}
          </UBadge>
        </div>

        <div>
          <p class="text-sm text-cool-400">Judul</p>
          <p class="text-md font-bold">{{ selectedSk?.judul }}</p>
        </div>

        <div>
          <p class="text-sm text-cool-400">Tanggal Terbit</p>
          <p class="text-md font-bold">{{ format(new Date(selectedSk!.tgl_terbit.replace(' ', 'T').split('.')[0]), 'dd MMMM yyyy') }}</p>
        </div>

        <div>
          <p class="text-sm text-cool-400">Penanggung Jawab</p>
          <p class="text-md font-bold">{{ selectedSk?.penanggung_jawab ? selectedSk?.penanggung_jawab.nama : selectedSk?.pj }}</p>
        </div>

        <!-- button file -->
        <div>
          <p class="text-sm text-cool-400 mb-1">File</p>
          <template v-if="selectedSk?.berkas">
            <UButton 
              icon="i-tabler-file-text"
              color="blue" size="xs" @click="handleOpenFile(selectedSk.berkas)">
              Lihat File
            </UButton>
          </template>

          <template v-else>
            <UButton 
              icon="i-tabler-file-off"
              color="rose" size="xs" :disabled="true">
              Lihat File
            </UButton>
          </template>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { SuratKeputusan } from '~/types/Sk';
import { format } from 'date-fns';

const props = defineProps<{
  selectedSk: SuratKeputusan
}>()

const selectedSk = ref<SuratKeputusan>(props.selectedSk)
watch(() => props.selectedSk, (newValue) => {
  selectedSk.value = newValue
})

async function handleOpenFile(berkas: string) {
  const url = `http://192.168.100.33/webapps/rsia_sk/${berkas}`
  window.open(url, '_blank')
}
</script>
