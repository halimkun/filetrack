<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
    <div class="w-full flex flex-col xl:flex-row gap-4 mb-4 items-start">
      <div class="w-full space-y-3">
        <template v-if="state.no_surat">
          <!-- Nomor Surat -->
          <UFormGroup label="Nomor Surat" class="w-full">
            <UInput v-model="state.no_surat" placeholder="Perihal Surat" variant="outline" disabled />
          </UFormGroup>
        </template>

        <!-- Perihal -->
        <UFormGroup label="Perihal" name="perihal" class="w-full">
          <UTextarea v-model="state.perihal" placeholder="Perihal Surat" variant="outline" resize />
        </UFormGroup>

        <div class="flex gap-3">
          <!-- Tanggal Terbit -->
          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block size="lg" icon="i-heroicons-calendar-days-20-solid"
                :label="state.tgl_terbit && format(state.tgl_terbit, 'dd MMMM yyyy')"
                :color="state.tgl_terbit ? 'primary' : 'gray'" variant="solid"
              />

              <template #panel="{ close }">
                <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>

          <!-- Status -->
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

        <!-- Penanggung Jawab -->
        <UFormGroup label="Penanggung Jawab" name="pj" class="w-full">
          <div class="flex gap-3">
            <div class="w-[30%]">
              <UInput v-model="state.pj" color="gray" readonly />
            </div>

            <SelectKaryawan :pj="state.pj" @update:selectedPegawai="state.pj = $event" />
          </div>
        </UFormGroup>

        <!-- catatan -->
        <UFormGroup label="Catatan" name="catatan" class="w-full">
          <UTextarea v-model="state.catatan" placeholder="Catatan Surat" variant="outline" resize />
        </UFormGroup>
        
        <div class="pt-3 border-t-2 border-t-gray-200 dark:border-t-gray-700">
          <UCheckbox v-model="hasUndangan" name="undangan" label="Buat Undangan" />
          <div v-if="hasUndangan" class="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 space-y-3">
            <!-- lokasi kegiatan -->
            <UFormGroup label="Lokasi" required class="flex flex-col" name="lokasi">
              <UInput v-model="undanganState.lokasi" placeholder="Lokasi kegiatan" variant="outline" size="lg" />
            </UFormGroup>

            <!-- tanggal kegiatan -->
            <UFormGroup label="Tanggal Kegiatan" name="tanggal" class="w-full">
              <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton block size="lg" icon="i-heroicons-calendar-days-20-solid"
                  :label="undanganState.tanggal && format(undanganState.tanggal, 'dd MMMM yyyy HH:mm')"
                  :color="undanganState.tanggal ? 'lime' : 'gray'" variant="solid"
                />

                <template #panel="{ close }">
                  <DatePicker v-model="undanganState.tanggal" is-required @close="close" mode="dateTime" />
                </template>
              </UPopover>
            </UFormGroup>

            <!-- deskripsi -->
            <UFormGroup label="Deskripsi" name="deskripsi" class="w-full">
              <UTextarea v-model="undanganState.deskripsi" placeholder="Deskripsi kegiatan" variant="outline" resize />
            </UFormGroup> 
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-3 justify-end">
      <UButton square type="submit" :loading="postPending" :disable="postPending" :icon="props.selectedData ? 'i-tabler-edit' : 'i-tabler-plus'">
        {{ props.selectedData ? 'Ubah' : 'Tambah' }} Surat
      </UButton>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import type { SuratInternalDenganUndangan } from '~/types/surat-internal.types'

import { logEvent } from '~/utils/firebase'
import { format } from 'date-fns'
import { z } from 'zod'

const emit = defineEmits(['refreshTable', 'closeModal'])
const props = defineProps<{
  selectedData?: SuratInternalDenganUndangan,
}>()

const schema = z.object({
  no_surat: z.string().optional().nullable(),
  perihal: z.string().min(10, "Perihal harus diisi"),
  tgl_terbit: z.date(),
  pj: z.string().min(3, "Penanggung Jawab harus dipilih"),
  status: z.enum(['pengajuan', 'disetujui', 'ditolak', 'batal']),
  catatan: z.string().optional(),

  undangan: z.object({
    lokasi: z.string().min(5, "Lokasi harus diisi"),
    tanggal: z.union([z.string(), z.date()]),
    deskripsi: z.string().optional(),
  }).optional(),
})

type Schema = z.output<typeof schema>

const tokenStore = useTokenStore();
const config = useRuntimeConfig()
const toasts = useToast()
const postPending = ref(false)
const hasUndangan = ref(props.selectedData?.undangan ? true : false)
const { API_V2_URL } = config.public

const state = reactive({
  no_surat: props.selectedData?.no_surat || '',
  perihal: props.selectedData?.perihal || '',
  tgl_terbit: props.selectedData?.tgl_terbit ? new Date(props.selectedData?.tgl_terbit) : new Date(),
  pj: props.selectedData?.pj || '',
  status: props.selectedData?.status || 'pengajuan',
  catatan: props.selectedData?.catatan || '-',
})

const undanganState = reactive({
  lokasi: props.selectedData?.undangan?.lokasi || '',
  tanggal: props.selectedData?.undangan?.tanggal ? new Date(props.selectedData?.undangan.tanggal) : new Date(),
  deskripsi: props.selectedData?.undangan?.deskripsi || '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true
  const data = {
    ...event.data,
    tgl_terbit: format(state.tgl_terbit, 'yyyy-MM-dd'),
  };

  if (hasUndangan.value) {
    data.undangan = {
      lokasi: undanganState.lokasi,
      tanggal: format(undanganState.tanggal, 'yyyy-MM-dd HH:mm:ss'),
      deskripsi: undanganState.deskripsi,
    };
  }

  if (data.no_surat) {
    delete data.no_surat;
  }
  
  const actionQueryMethod = props.selectedData ? 'PUT' : 'POST';
  const actionUrl = props.selectedData
    ? `${API_V2_URL}/surat/internal/${props.selectedData.id}`
    : `${API_V2_URL}/surat/internal`;
  
  const { data: postData, status, error } = await useFetch(`${actionUrl}?_method=${actionQueryMethod}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    body: JSON.stringify(data),
  });
  
  if (status.value !== 'pending') {
    postPending.value = false;
  }

  if (error.value) {
    const errorMessage = error.value.data?.message || error.value.message;

    toasts.add({ title: 'Error', description: errorMessage, color: 'red' });
    logEvent('create_surat_internal_error', { data: postData, error: errorMessage });
    console.error("POST DATA ERROR", error.value.data);

    return;
  }

  toasts.add({ title: 'Success', description: 'Surat internal berhasil ditambahkan', color: 'green' });
  logEvent('create_surat_internal', { data: postData });
  
  emit('refreshTable');
  emit('closeModal');
}
</script>