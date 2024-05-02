<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
    <div class="w-full flex flex-col xl:flex-row gap-4 mb-4 items-start">
      <UCard class="w-full xl:w-[60%]">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-edit" color="indigo" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Surat Internal</h1>
            </div>
          </div>
        </template>

        <template v-if="no_surat">
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
                :label="tglTerbit && format(tglTerbit, 'd MMM, yyy')" :color="tglTerbit ? 'primary' : 'gray'"
                variant="soft" 
              />

              <template #panel="{ close }">
                <DatePicker v-model="tglTerbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>

          <!-- Tanggal Kegiatan -->
          <UFormGroup label="Tanggal Kegiatan" name="tanggal" class="w-full">
            <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid"
                :label="tglKegiatan && format(tglKegiatan, 'd MMM, yyy HH:mm')" :color="tglKegiatan ? 'cyan' : 'gray'"
                variant="soft" />

              <template #panel="{ close }">
                <DatePicker v-model="tglKegiatan" mode="dateTime" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>
        </div>

        <div class="mt-4 space-y-3">
          <UFormGroup label="Tempat Kegiatan" name="tempat" class="w-full">
            <UInput v-model="state.tempat" placeholder="Tempat Kegiatan" variant="outline" />
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

          <UFormGroup label="Perihal" name="perihal" class="w-full">
            <UTextarea v-model="state.perihal" placeholder="Perihal Surat" variant="outline" resize />
          </UFormGroup>
        </div>
      </UCard>

      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-note" color="lime" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Catatan Surat</h1>
            </div>
          </div>
        </template>

        <UTextarea v-model="state.catatan" placeholder="Catatan Surat" variant="outline" resize />
      </UCard>
    </div>

    <UCard class="p-0">
      <div class="flex justify-end">
        <UButton size="xs" square type="submit" :loading="postPending" :icon="actionUrl?.includes('PUT') || actionUrl?.includes('PATCH') ? 'i-tabler-edit' : 'i-tabler-plus'">
          {{ actionUrl?.includes('PUT') || actionUrl?.includes('PATCH') ? 'Ubah' : 'Tambah' }} Surat
        </UButton>
      </div>
    </UCard>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'
import { z } from 'zod'

const { no_surat, tgl_terbit, tanggal, tempat, pj, perihal, catatan, actionUrl } = defineProps<{
  no_surat?: string,
  tgl_terbit?: Date,
  tanggal?: Date,
  tempat?: string,
  pj?: string,
  perihal?: string,
  catatan?: string,

  actionUrl?: string
}>();

const schema = z.object({
  tgl_terbit: z.date(),
  tanggal: z.date(),
  tempat: z.string().optional(),
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
  perihal: z.string().min(10, "Perihal harus diisi"),
  catatan: z.string().optional(),
})

type Schema = z.output<typeof schema>

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()
const toasts = useToast()
const router = useRouter()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore

const tglTerbit = tgl_terbit ? new Date(tgl_terbit) : new Date()
const tglKegiatan = tanggal ? new Date(tanggal) : new Date()
const postPending = ref(false)

const state = reactive({
  no_surat: no_surat || undefined,
  tgl_terbit: tglTerbit,
  tanggal: tglKegiatan,
  tempat: tempat || '-',
  pj: pj || '',
  perihal: perihal || '',
  catatan: catatan || '-',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true
  const data = {
    ...event.data,
    tgl_terbit: format(tglTerbit, 'yyyy-MM-dd'), // Menggunakan format date-fns untuk mengonversi tanggal
    tanggal: format(tglKegiatan, "yyyy-MM-dd HH:mm:ss"), // Menggunakan format date-fns untuk mengonversi tanggal
  };

  const url = actionUrl ?? `${API_V2_URL}/surat/internal`;
  const method = actionUrl?.includes('PUT') ? 'PUT' : actionUrl?.includes('PATCH') ? 'PATCH' : 'POST';

  const { data: postData, pending, error } = await useFetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });

  if (error.value) {
    const errorMessage = error.value.data?.message || error.value.message;
    toasts.add({ title: 'Error', description: errorMessage, color: 'red' });
    console.error("POST DATA ERROR", error.value.data);
    return;
  }

  if (!pending.value) {
    postPending.value = false;
  }

  toasts.add({ title: 'Success', description: 'Surat internal berhasil ditambahkan', color: 'green' });
  router.push('/surat/internal');
}
</script>