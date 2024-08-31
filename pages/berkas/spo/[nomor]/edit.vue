<template>
  <UForm :state="state" @submit="onSubmit">
    <div class="w-full gap-4 flex items-start flex-col xl:flex-row">
      <UCard class="w-full xl:w-[36%] top-5">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-edit" color="primary" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg capitalize">Detail SPO</h1>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Judul SPO -->
          <UFormGroup label="Judul SPO" name="judul" class="w-full">
            <UTextarea v-model="state.judul" placeholder="Judul SPO" variant="outline" />
          </UFormGroup>
  
          <!-- Unit -->
          <UFormGroup label="Unit" name="unit" class="w-full">
            <SelectDepartemen :dep="state.unit" />
          </UFormGroup>
  
          <!-- Unit Terkait -->
          <UFormGroup label="Unit Terkait" name="unit_terkait" class="w-full">
            <SelectMultiDepartemen :depIds="state.unit_terkait" @update:depIds="state.unit_terkait = $event" />
          </UFormGroup>
  
          <!-- Tanggal Terbit -->
          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid"
                :label="state.tgl_terbit ? format(state.tgl_terbit, 'd MMMM, yyy', { locale: id }) : 'Tanggal Terbit'"
                :color="state.tgl_terbit ? 'primary' : 'rose'" variant="soft" />
  
              <template #panel="{ close }">
                <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>
  
          <!-- Jenis -->
          <UFormGroup label="Jenis" name="jenis" class="w-full">
            <URadio v-for="jenis of jenis" :key="jenis.value" v-model="state.jenis" v-bind="jenis" />
          </UFormGroup>
        </div>
      </UCard>

      <div class="flex flex-col gap-4 w-full">
        <UCard class="w-full">
          <template #header>
            <div class="flex gap-2 items-start">
              <UButton icon="i-tabler-edit" color="primary" size="xs" square variant="soft" />
              <div>
                <h1 class="text-lg capitalize">Isi SPO</h1>
              </div>
            </div>
          </template>

          <div class="grid gap-4 grid-cols-1 xl:grid-cols-2">
            <ClientOnly>
              <UFormGroup class="w-full" label="Pengertian" name="pengertian">
                <TiptapEditor v-model="state.pengertian" />
              </UFormGroup>
            </ClientOnly>

            <ClientOnly>
              <UFormGroup class="w-full" label="Tujuan" name="tujuan">
                <TiptapEditor v-model="state.tujuan" />
              </UFormGroup>
            </ClientOnly>

            <ClientOnly>
              <UFormGroup class="w-full" label="Kebijakan" name="kebijakan">
                <TiptapEditor v-model="state.kebijakan" />
              </UFormGroup>
            </ClientOnly>

            <ClientOnly>
              <UFormGroup class="w-full" label="Prosedur" name="prosedur">
                <TiptapEditor v-model="state.prosedur" />
              </UFormGroup>
            </ClientOnly>
          </div>
        </UCard>

        <div class="">
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex gap-2 items-start">
                  <UButton icon="i-tabler-send" color="primary" size="xs" square variant="soft" />
                  <div>
                    <h1 class="text-lg capitalize">SIMPAN <strong class="text-primary">SPO</strong></h1>
                  </div>
                </div>

                <div class="flex gap-2">
                  <UButton label="Simpan" type="submit" color="primary" :loading="isLoading" />
                </div>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { logEvent } from '~/utils/firebase'

import type { FormSubmitEvent } from '#ui/types'

const route = useRoute()
const toasts = useToast()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const isLoading = ref(false)
const { API_V2_URL } = runtimeConfig.public
const accessToken = accessTokenStore.accessToken

const nomor = route.params.nomor as string

const { data, error, status } = await useFetch<any>(`${API_V2_URL}/berkas/spo/${nomor}`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

if (error.value) {
  toasts.add({
    title: 'Error',
    description: 'ERROR SPO DATA : ' + error.value.statusMessage,
    color: 'red'
  })

  console.error(error.value.statusMessage)
}


const jenis = [
  { value: 'medis', label: 'Medis' },
  { value: 'penunjang', label: 'Penunjang' },
  { value: 'umum', label: 'Umum' },
];

const unitSchema = z.object({
  dep_id: z.string(),
  nama: z.string(),
  kelompok: z.string().nullable(),
  aktif: z.string().nullable(),
  tele_id: z.string().nullable(),
});

const schema = z.object({
  judul: z.string().min(5, 'Pengertian harus harus diisi').max(255, 'Judul terlalu panjang'),
  unit: z.string().min(1, 'Unit harus diisi'),
  unit_terkait: z.array(unitSchema).min(1, 'Unit terkait harus diisi'),
  tgl_terbit: z.date(),
  jenis: z.enum(['umum', 'penunjang', 'medis']),
  pengertian: z.string().min(5, 'Pengertian harus harus diisi'),
  tujuan: z.string().min(5, 'Pengertian harus harus diisi'),
  kebijakan: z.string().min(5, 'Pengertian harus harus diisi'),
  prosedur: z.string().min(5, 'Pengertian harus harus diisi'),
});

// data?.value?.data?.unit_terkait is string separated by comma

type Schema = z.output<typeof schema>

const spo = ref(data?.value?.data) as Ref<{
  judul?: string;
  unit?: string;
  unit_terkait?: string;
  tgl_terbit?: string;
  jenis?: string;
  detail?: {
    pengertian?: string;
    tujuan?: string;
    kebijakan?: string;
    prosedur?: string;
  }
} | null>

const state = reactive({
  judul: spo?.value?.judul,
  unit: spo?.value?.unit,
  unit_terkait: spo?.value?.unit_terkait?.split(','),
  tgl_terbit: spo?.value?.tgl_terbit ? new Date(spo?.value?.tgl_terbit) : new Date(),
  jenis: spo?.value?.jenis,

  pengertian: spo?.value?.detail?.pengertian ?? "",
  tujuan: spo?.value?.detail?.tujuan ?? "",
  kebijakan: spo?.value?.detail?.kebijakan ?? "",
  prosedur: spo?.value?.detail?.prosedur ?? "",
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;

  // event data unit make only name 
  const postData = {
    ...event.data,
    unit: event.data.unit,
    unit_terkait: event.data.unit_terkait.join(','),
    tgl_terbit: format(event.data.tgl_terbit, 'yyyy-MM-dd'),
  }

  const { data, pending, error, refresh, status } = await useFetch(`${runtimeConfig.public.API_V2_URL}/berkas/spo/${nomor}?_method=PUT`,{
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (error.value) {
    logEvent('create_spo_error', error.value)
    toasts.add({
      title: 'Gagal',
      description: error.value.message,
      color: 'red',
    })

    isLoading.value = false;
  }

  if (status.value == 'success') {
    logEvent('create_spo_success', data)
    toasts.add({
      title: 'Berhasil',
      description: 'SPO berhasil disimpan',
      color: 'green',
    })
    
    isLoading.value = false;
    router.push('/berkas/spo')
  }
}
</script>