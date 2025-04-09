<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton :icon="isUpdate ? 'i-heroicons-pencil-square-16-solid' : 'i-heroicons-eye-20-solid'" color="blue" size="xs" square variant="soft" />
            <h1 class="text-lg">
              {{ isUpdate ? 'Update Berkas' : 'Tambah Berkas' }} SK
            </h1>
          </div>
        </div>
      </template>

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
        <UFormGroup label="Penanggung Jawab" name="pj" class="w-full mb-4">
          <div class="flex gap-3">
            <div class="w-[30%]">
              <UInput v-model="state.pj" color="gray" readonly />
            </div>

            <SelectKaryawan :pj="state.pj" @update:selectedPegawai="state.pj = $event" />
          </div>
        </UFormGroup>

        <UFormGroup label="Judul SK" name="judul" class="w-full mb-4">
          <UInput v-model="state.judul" placeholder="Judul SK" variant="outline" />
        </UFormGroup>

        <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full mb-4">
          <UPopover :popper="{ placement: 'bottom-start' }" :disabled="isUpdate">
            <UButton block icon="i-heroicons-calendar-days-20-solid" :label="format(state.tgl_terbit, 'd MMM, yyy')"
              :color="state.tgl_terbit ? 'primary' : 'rose'" variant="soft" />

            <template #panel="{ close }">
              <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
            </template>
          </UPopover>
        </UFormGroup>

        <div v-if="isUpdate" class="mb-4">
          <UAlert
            icon="i-heroicons-command-line"
            color="yellow"
            variant="subtle"
            title="Warning !"
            description="Tanggal terbit tidak bisa diubah, jika terdapat kesalahan data data menghubungi admin."
          />
        </div>


        <UFormGroup label="Jenis SK" name="jenis" class="w-full mb-4">
          <USelectMenu v-model="state.jenis" :options="statusOptions" placeholder="Pilih Jenis SK"
            option-attribute="label" value-attribute="value" />
        </UFormGroup>

        <div class="mt-10 flex justify-end">
          <UButton type="submit" color="green" icon="i-tabler-check" label="Update" :loading="postPending"
            :disabled="postPending" />
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import type { SuratKeputusanData } from '~/types/Sk';
import { logEvent } from '~/utils/firebase'

import { format } from 'date-fns'
import { z } from 'zod'

const toasts = useToast()
const router = useRouter()
const identifier = ref<String | null>(null)
const isUpdate = ref(false)
const postPending = ref(false)
const config = useRuntimeConfig()
const tokenStore = useTokenStore();

const props = defineProps<{
  selectedSk?: SuratKeputusanData | undefined | null
}>()

const selectedSk = ref<SuratKeputusanData | undefined | null>(props.selectedSk)
watch(() => props.selectedSk, (newValue) => {
  selectedSk.value = newValue
  // update state
  state.judul = newValue?.judul || ''
  state.pj = newValue?.pj || ''
  state.tgl_terbit = newValue?.tgl_terbit ? new Date(newValue?.tgl_terbit) : new Date()
  state.jenis = newValue?.jenis || ''

  // set isUpdate
  isUpdate.value = newValue !== null

  // set identifier base64 encoded from nomor.jenis.tgl_terbit
  identifier.value = btoa([newValue?.nomor, newValue?.jenis, newValue?.tgl_terbit].join('.'))
})

const statusOptions = [
  { label: "SK Dokumen", value: "A" },
  { label: "SK Pengangkatan Jabatan", value: "B" },
];

type Schema = z.output<typeof schema>
const schema = z.object({
  judul: z.string().min(10, 'Judul harus diisi'),
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
  tgl_terbit: z.date(),
  jenis: z.string().min(1, "Jenis Surat harus dipilih"),
})

const state = reactive({
  judul: selectedSk?.value?.judul || '',
  pj: selectedSk?.value?.pj || '',
  tgl_terbit: selectedSk?.value?.tgl_terbit ? new Date(selectedSk?.value?.tgl_terbit) : new Date(),
  jenis: selectedSk?.value?.jenis || '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true;

  try {
    const data = {
      ...event.data,
      tgl_terbit: format(state.tgl_terbit, 'yyyy-MM-dd'),
    };

    const { API_V2_URL } = config.public;
    let url = isUpdate.value ? `${API_V2_URL}/berkas/sk/${identifier.value}?_method=PUT` : `${API_V2_URL}/berkas/sk`;

    const { status, error } = await useFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenStore.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (error.value) {
      logEvent('create_sk_error', { error: error.value.message || 'Terjadi kesalahan saat membuat Berkas' })
      throw new Error(error.value.message || 'Terjadi kesalahan saat membuat Berkas');
    }

    if (status.value === 'success') {
      logEvent('create_sk_success', { data: data })
      toasts.add({
        title: 'Success',
        description: 'Berkas berhasil dibuat',
        color: 'green',
      });
      router.go(0);
    }
  } catch (error: any) {
    logEvent('create_sk_error', { error: error?.message || 'Terjadi kesalahan saat membuat Berkas' })
    console.error("POST DATA ERROR", error);
    toasts.add({
      title: 'Error',
      description: 'Terjadi kesalahan saat membuat Berkas',
      color: 'red',
    });
  } finally {
    postPending.value = false;
  }
}

</script>