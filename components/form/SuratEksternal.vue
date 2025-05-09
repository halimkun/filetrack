<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
    <div class="w-full flex flex-col xl:flex-row gap-4 mb-4 items-start">
      <div class="w-full space-y-4">
        <template v-if="state.no_surat">
          <UFormGroup label="Nomor Surat" name="no_surat" class="w-full mb-4">
            <template #hint>
              <span class="text-yellow-500 dark:text-yellow-600 animate-pulse">Tidak bisa diubah</span>
            </template>
            <UInput v-model="state.no_surat" placeholder="Nomor Surat" color="gray" variant="outline" readonly />
          </UFormGroup>
        </template>

        <div class="flex items-start justify-start gap-4">
          <!-- Tanggal Terbit -->
          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid"
                :label="state.tgl_terbit ? format(state.tgl_terbit, 'd MMM, yyy') : 'Tanggal Terbit'" 
                :color="state.tgl_terbit ? 'primary' : 'rose'"
                variant="soft" size="lg"
              />

              <template #panel="{ close }">
                <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup label="Status" required class="flex flex-col w-full" name="status">
            <USelectMenu :options="[
              { value: 'pengajuan', label: 'Pengajuan', colors: ['yellow'] },
              { value: 'disetujui', label: 'Disetujui', colors: ['sky'] },
              { value: 'ditolak', label: 'Ditolak', colors: ['red'] },
              { value: 'batal', label: 'Batal', colors: ['gray'] },
            ]" placeholder="Pilih Status" searchable v-model="state.status"
              searchable-placeholder="Cari Status" option-attribute="label" value-attribute="value"
              :search-attributes="['value', 'label', 'colors']" size="lg">
              <template #option="{ option: status }">
                <span v-for="color in status.colors" :key="color.id" class="h-3 w-3 rounded-full mr-2" :class="`bg-${color}-500 dark:bg-${color}-400`"></span>
                <span class="truncate">{{ status.label }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>

        <div class="mt-4 space-y-3">
          <UFormGroup label="Perihal" name="perihal" class="w-full">
            <UInput size="md" v-model="state.perihal" placeholder="perihal" variant="outline" />
          </UFormGroup>

          <UFormGroup label="Penanggung Jawab" name="pj" class="w-full">
            <div class="flex gap-3">
              <div class="w-[30%]">
                <UInput v-model="state.pj" color="gray" readonly />
              </div>

              <SelectKaryawan 
                :pj="state.pj"
                @update:selectedPegawai="state.pj = $event"
              />
            </div>
          </UFormGroup>

          <UFormGroup label="Alamat/Instansi Tujuan" name="alamat" class="w-full">
            <UTextarea v-model="state.alamat" placeholder="alamat/instansi tujuan" variant="outline" resize />
          </UFormGroup>
        </div>
        
        <div class="flex justify-end">
          <UButton size="xs" square type="submit" :loading="postPending" :disabled="postPending" :icon="props?.selectedData ? 'i-tabler-edit' : 'i-tabler-plus'">
            {{ props?.selectedData ? 'Ubah' : 'Tambah' }} Surat
          </UButton>
        </div>
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import type { SuratEksternal } from '~/types/surat-eksternal.types'

import { logEvent } from '~/utils/firebase'
import { format } from 'date-fns'
import { z } from 'zod'

const emit = defineEmits(['refreshTable', 'closeModal'])
const props = defineProps<{
  selectedData?: SuratEksternal
}>()

const tokenStore = useTokenStore();
const config = useRuntimeConfig()
const toasts = useToast()

const { API_V2_URL } = config.public
const postPending = ref(false)

type Schema = z.output<typeof schema>

// Table Schema
const schema = z.object({
  no_surat: z.string().optional().nullable(),
  status: z.enum(['pengajuan', 'disetujui', 'ditolak', 'batal']),
  tgl_terbit: z.date(),
  perihal: z.string().min(10, "Perihal harus diisi"),
  alamat: z.string().min(1, "Alamat harus diisi, jika tidak ada isikan '-'"),

  pj: z.string().min(3, "Penanggung Jawab harus dipilih"),
})

// State Form Value
const state = reactive({
  no_surat: props.selectedData?.no_surat || undefined,
  status: props.selectedData?.status || 'pengajuan',
  tgl_terbit: props.selectedData?.tgl_terbit ? new Date(props.selectedData?.tgl_terbit) : new Date(),
  perihal: props.selectedData?.perihal || '',
  alamat: props.selectedData?.alamat || '',

  pj: props.selectedData?.pj || '',
})

// Submit Handle
async function onSubmit(event: FormSubmitEvent<Schema>) {
  logEvent('submit_surat_eksternal', state)
  postPending.value = true
  const data = {
    ...event.data,
    tgl_terbit: format(state.tgl_terbit, 'yyyy-MM-dd'), // Menggunakan format date-fns untuk mengonversi tanggal
  };

  if (data.no_surat) {
    console.log("NO SURAT", data.no_surat);
    delete data.no_surat
  }

  const actionQueryMethod = props.selectedData?.created_at ? 'PUT' : 'POST';
  const url = props.selectedData?.created_at
    ? `${API_V2_URL}/surat/eksternal/${props.selectedData?.id}`
    : `${API_V2_URL}/surat/eksternal`;
  
  const { data: postData, status, error } = await useFetch(`${url}?_method=${actionQueryMethod}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    body: JSON.stringify(data),
  }).finally(() => {
    postPending.value = false
  });

  if (error.value) {
    logEvent('submit_surat_eksternal_error', error.value);
    const errorMessage = error.value.data?.message || error.value.message;
    toasts.add({ title: 'Error', description: errorMessage, color: 'red' });
    console.error("POST DATA ERROR", error.value.data);
    return;
  }

  toasts.add({ title: 'Success', description: 'Surat eksternal berhasil ditambahkan', color: 'green' });
  logEvent('create_surat_eksternal', { data: postData });

  emit('refreshTable');
  emit('closeModal');
}
</script>