<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
    <div class="w-full flex flex-col xl:flex-row gap-4 mb-4 items-start">
      <div class="w-full space-y-4">
        <UCard>
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

            <!-- Tanggal Surat -->
            <UFormGroup label="Tanggal Surat" name="tanggal" class="w-full">
              <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
                <UButton block icon="i-heroicons-calendar-days-20-solid"
                  :label="tglSurat && format(tglSurat, 'd MMM, yyy HH:mm')" :color="tglSurat ? 'cyan' : 'gray'"
                  variant="soft" />

                <template #panel="{ close }">
                  <DatePicker v-model="tglSurat" mode="dateTime" is-required @close="close" />
                </template>
              </UPopover>
            </UFormGroup>
          </div>

          <div class="mt-4 space-y-3">
            <UFormGroup label="Alamat Tujuan" name="alamat" class="w-full">
              <UInput v-model="state.alamat" placeholder="alamat tujuan" variant="outline" />
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
        
        <UCard class="p-0">
          <div class="flex justify-end">
            <UButton size="xs" square type="submit" :loading="postPending" :icon="actionUrl?.includes('PUT') || actionUrl?.includes('PATCH') ? 'i-tabler-edit' : 'i-tabler-plus'">
              {{ actionUrl?.includes('PUT') || actionUrl?.includes('PATCH') ? 'Ubah' : 'Tambah' }} Surat
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Right Cols -->
      <div class="w-full xl:w-[60%]">
        <UAlert
          icon="i-heroicons-exclamation-triangle-16-solid"
          color="orange"
          variant="soft"
          title="Perhatian!"
          description="Mohon pastikan data yang diinputkan sudah benar, karena data yang sudah ditambahkan tidak bisa dihapus."
        />
      </div>
    </div>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'
import { z } from 'zod'

const { no_surat, tgl_terbit, tanggal, alamat, pj, perihal, actionUrl } = defineProps<{
  no_surat?: string,
  tgl_terbit?: Date,
  tanggal?: Date,
  alamat?: string,
  pj?: string,
  perihal?: string,

  actionUrl?: string
}>();

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()
const toasts = useToast()
const router = useRouter()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore

const tglTerbit = tgl_terbit ? new Date(tgl_terbit) : new Date()
const tglSurat = tanggal ? new Date(tanggal) : new Date()
const postPending = ref(false)

type Schema = z.output<typeof schema>

// Table Schema
const schema = z.object({
  tgl_terbit: z.date(),
  tanggal: z.date(),
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
  alamat: z.string().min(1, "Alamat harus diisi, jika tidak ada isikan '-'"),
  perihal: z.string().min(10, "Perihal harus diisi"),
})

// State Form Value
const state = reactive({
  no_surat: no_surat || undefined,
  tgl_terbit: tglTerbit,
  tanggal: tglSurat,
  alamat: alamat || '-',
  pj: pj || '',
  perihal: perihal || '',
})


// Submit Handle
async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true
  const data = {
    ...event.data,
    tgl_terbit: format(tglTerbit, 'yyyy-MM-dd'), // Menggunakan format date-fns untuk mengonversi tanggal
    tanggal: format(tglSurat, "yyyy-MM-dd HH:mm:ss"), // Menggunakan format date-fns untuk mengonversi tanggal
  };

  const url = actionUrl ?? `${API_V2_URL}/surat/eksternal`;
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

  toasts.add({ title: 'Success', description: 'Surat eksternal berhasil ditambahkan', color: 'green' });
  router.push('/surat/eksternal');
}
</script>