<template>
  <UCard>
    <template #header>
      <div class="flex gap-2 items-start">
        <UButton icon="i-tabler-edit" color="lime" size="xs" square variant="soft" />
        <div>
          <h1 class="text-lg">Berkas PKS</h1>
        </div>
      </div>
    </template>

    <UForm :state="state" :schema="schema" @submit="onSubmit" :pending="postPending">
      <div class="flex w-full gap-4">
        <div class="w-full">
          <UFormGroup label="Judul" name="judul">
            <UInput v-model="state.judul" placeholder="Judul Berkas PKS" variant="outline" />
          </UFormGroup>
        </div>
        <div class="w-full">
          <UFormGroup label="Tipe" name="jenis">
            <USelectMenu v-model="state.jenis" :options="[
              { label: 'Internal', value: 'A' },
              { label: 'Eksternal', value: 'B' }
            ]" @update:selected="state.jenis = $event" value-attribute="value" label-attribute="label"
              placeholder="Pilih Tipe Berkas PKS" />
          </UFormGroup>
        </div>
      </div>

      <div class="flex gap-4 mt-4">
        <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
          <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid"
              :label="state.tgl_terbit ? format(state.tgl_terbit, 'd MMM yyy') : 'Pilih Tanggal Terbit'"
                color='primary' :variant="state.tgl_terbit ? 'soft' : 'outline'" :disabled="!!(actionUrl && (String(actionUrl).includes('?_method=PUT') || String(actionUrl).includes('?_method=PATCH')))" />

            <template #panel="{ close }">
              <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
            </template>
          </UPopover>
        </UFormGroup>

        <UFormGroup label="Tanggal Awal" name="tanggal_awal" class="w-full">
          <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid"
              :label="state.tanggal_awal ? format(state.tanggal_awal, 'd MMM yyy') : 'Pilih Tanggal Awal'"
              color='cyan' :variant="state.tanggal_awal ? 'soft' : 'outline'" />

            <template #panel="{ close }">
              <DatePicker v-model="state.tanggal_awal" is-required @close="close" />
            </template>
          </UPopover>
        </UFormGroup>
        <!-- Tanggal Kegiatan -->
        <UFormGroup label="Tanggal Akhir" name="tanggal_akhir" class="w-full">
          <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid"
              :label="state.tanggal_akhir ? format(state.tanggal_akhir, 'd MMM yyy') : 'Pilih Tanggal Akhir'"
              color='cyan' :variant="state.tanggal_akhir ? 'soft' : 'outline'" />

            <template #panel="{ close }">
              <DatePicker v-model="state.tanggal_akhir" is-required @close="close" />
            </template>
          </UPopover>
        </UFormGroup>
      </div>

      <div class="flex gap-4 w-full mt-4">
        <template v-if="actionUrl && String(actionUrl).includes('?_method=PUT') || actionUrl && String(actionUrl).includes('?_method=PATCH')">
          <div class="w-full">
            <UFormGroup label="No. PKS Internal" name="no_pks_internal">
              <template #hint>
                <span class="text-yellow-500 dark:text-yellow-600 animate-pulse">Tidak bisa diubah</span>
              </template>

              <UInput v-model="state.no_pks_internal" placeholder="Nomor PKS Internal" variant="outline" color="gray" :disabled="!!(actionUrl && (String(actionUrl).includes('?_method=PUT') || String(actionUrl).includes('?_method=PATCH')))"/>
            </UFormGroup>
          </div>
        </template>

        <div class="w-full">
          <UFormGroup label="No. PKS Eksternal" name="no_pks_eksternal">
            <UInput v-model="state.no_pks_eksternal" placeholder="Nomor PKS Eksternal" variant="outline" />
          </UFormGroup>
        </div>
        <div class="w-full">
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
        </div>
      </div>

      <div class="mt-6">
        <UButton type="submit" color="cyan" :loading="postPending" :disabled="postPending" icon="i-tabler-send-2">
          {{ actionUrl && String(actionUrl).includes('?_method=PUT') || actionUrl && String(actionUrl).includes('?_method=PATCH') ? 'Simpan' : 'Tambah' }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { logEvent } from '~/utils/firebase'
import { format } from 'date-fns'
import { z } from 'zod'

const tokenStore = useTokenStore();
const config = useRuntimeConfig()
const toasts = useToast()
const router = useRouter()

const jenisPks = ref<string>('')
const postPending = ref(false)

const { API_V2_URL } = config.public
const { judul, jenis, tanggal_awal, tanggal_akhir, tgl_terbit, no_pks_eksternal, no_pks_internal, pj, actionUrl } = defineProps<{
  judul?: string,
  jenis?: string,
  tanggal_awal?: string,
  tanggal_akhir?: string | null | undefined,
  tgl_terbit?: string,
  no_pks_eksternal?: string | null | undefined,
  no_pks_internal?: string,
  pj?: string,

  actionUrl?: string
}>()

type Schema = z.output<typeof schema>
const schema = z.object({
  judul: z.string().min(10, "Judul harus diisi"),
  jenis: z.enum(['A', 'B']),
  tanggal_awal: z.date(),
  tanggal_akhir: z.date().nullable(),
  tgl_terbit: z.date(),
  no_pks_eksternal: z.string(),
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
})

const state = reactive({
  judul: judul || '',
  jenis: no_pks_internal?.includes('/A/') ? 'A' : 'B',
  tanggal_awal: tanggal_awal && tanggal_awal !== '0000-00-00' ? new Date(tanggal_awal) : new Date(),
  tanggal_akhir: tanggal_akhir && tanggal_akhir !== '0000-00-00' ? new Date(tanggal_akhir) : null,
  tgl_terbit: tgl_terbit && tgl_terbit !== '0000-00-00' ? new Date(tgl_terbit) : new Date(),
  no_pks_eksternal: no_pks_eksternal || '',
  no_pks_internal: no_pks_internal || '',
  pj: pj || '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true
  const data = {
    ...event.data,
    tanggal_awal: format(event.data.tanggal_awal, 'yyyy-MM-dd'), // Menggunakan format date-fns untuk mengonversi tanggal
    tanggal_akhir: event.data.tanggal_akhir ? format(event.data.tanggal_akhir, 'yyyy-MM-dd') : null, // Menggunakan format date-fns untuk mengonversi tanggal
    tgl_terbit: format(event.data.tgl_terbit, 'yyyy-MM-dd'), // Menggunakan format date-fns untuk mengonversi tanggal
    no_pks_eksternal: event.data.no_pks_eksternal || '-',
  };
  
  const url = actionUrl || `${API_V2_URL}/berkas/pks`;
  const { data: response, error, status } = await useFetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenStore.accessToken}` },
    body: data
  })

  if (error.value) {
    const errorMessage = error.value.data?.message || error.value.message;
    logEvent('post_berkas_pks_failed', { error: errorMessage });
    toasts.add({ title: 'Error', description: errorMessage, color: 'red' });
    console.error("POST DATA ERROR", error.value.data);
    return;
  }

  postPending.value = false;

  logEvent('post_berkas_pks_success', { data: response });
  toasts.add({ title: 'Success', description: 'Surat internal berhasil ditambahkan', color: 'green' });
  router.push('/berkas/kerjasama');
}
</script>