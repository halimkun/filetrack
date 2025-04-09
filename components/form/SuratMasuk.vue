<template>
  <ClientOnly fallback-tag="span" fallback="Loading comments...">
    <UForm :schema="schema" :state="state" @submit="onSubmit" enctype="multipart/form-data">
      <div class="w-full flex gap-4 mb-4">
        <UFormGroup label="No. SIMRS" name="no_simrs" class="w-full">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid" 
              :label="state.no_simrs ? format(state.no_simrs, 'd MMM, yyy') : 'No SIMRS'"
              color="primary" :variant="state.no_simrs ? 'soft' : 'outline'"
            />
    
            <template #panel="{ close }">
              <DatePicker v-model="state.no_simrs" is-required @close="close" />
            </template>
          </UPopover>
        </UFormGroup>
    
        <!-- No Surat -->
        <UFormGroup label="No. Surat" name="no_surat" class="w-full">
          <UInput placeholder="Nomor Surat" color="gray" variant="outline" v-model="state.no_surat" />
        </UFormGroup>
      </div>

      <!-- Perihal -->
      <UFormGroup label="Perihal" name="perihal" class="w-full mb-4">
        <UTextarea placeholder="Perihal Surat" variant="outline" resize v-model="state.perihal" />
      </UFormGroup>
    
      <!-- Pengirim -->
      <UFormGroup label="Pengirim" name="pengirim" class="w-full mb-4">
        <UInput placeholder="Pengirim Surat" variant="outline" v-model="state.pengirim" />
      </UFormGroup>
    
      <!-- pelaksanaan    pelaksanaan_end -->
      <div class="w-full flex gap-4 mb-4">
        <UFormGroup label="Tanggal Surat" name="tgl_surat" class="w-full">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid" 
              :label="state.tgl_surat ? format(state.tgl_surat, 'd MMM, yyy') : 'Tanggal Surat'"
              color="lime" :variant="state.tgl_surat ? 'soft' : 'outline'" />
    
            <template #panel="{ close }">
              <DatePicker v-model="state.tgl_surat" is-required @close="close" />
    
              <div class="w-full px-4 pb-5">
                <button type="button" class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
                  @click="state.tgl_surat = undefined">
                  Clear
                </button>
              </div>
            </template>
          </UPopover>
        </UFormGroup>

        <UFormGroup label="Tanggal Pelaksanaan" name="pelaksanaan" class="w-full">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid" 
              :label="state.pelaksanaan ? format(state.pelaksanaan, 'd MMM, yyy') : 'Tanggal Pelaksanaan'"
              color="cyan" :variant="state.pelaksanaan ? 'soft' : 'outline'" />
    
            <template #panel="{ close }">
              <DatePicker v-model="state.pelaksanaan" is-required @close="close" />
    
              <div class="w-full px-4 pb-5">
                <button type="button" class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
                  @click="state.pelaksanaan = null">
                  Clear
                </button>
              </div>
            </template>
          </UPopover>
        </UFormGroup>
    
        <UFormGroup label="Tanggal Selesai Pelaksanaan" name="pelaksanaan_end" class="w-full">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton block icon="i-heroicons-calendar-days-20-solid"
              :label="state.pelaksanaan_end ? format(state.pelaksanaan_end, 'd MMM, yyy') : 'Tanggal Selesai Pelaksanaan'"
              color="indigo" :variant="state.pelaksanaan_end ? 'soft' : 'outline'" />
    
            <template #panel="{ close }">
              <DatePicker v-model="state.pelaksanaan_end" is-required @close="close" />
              
              <div class="w-full px-4 pb-5">
                <button type="button" class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
                  @click="state.pelaksanaan_end = null">
                  Clear
                </button>
              </div>
            </template>
          </UPopover>
        </UFormGroup>
      </div>
    
      <!-- tempat -->
      <UFormGroup label="Tempat" name="tempat" class="w-full mb-4">
        <UInput placeholder="Tempat Pelaksanaan" variant="outline" v-model="state.tempat" />
      </UFormGroup>
    
      <!-- select menu -->
      <UFormGroup label="Via" name="ket" class="w-full mb-4">
        <USelectMenu 
          v-model="keteranganVia"
          :options="via"
          @update:selected="keteranganVia = $event"
          value-attribute="value"
          label-attribute="label"
          placeholder="Dikirim Via"
        />
      </UFormGroup>
    
      <!-- file -->
      <UFormGroup label="File" name="file" class="w-full mb-4">
        <UInput type="file" placeholder="File Surat" variant="outline" />
      </UFormGroup>

      <!-- button submit -->
      <div class="mt-8 flex justify-end">
        <UButton
          icon="i-tabler-send-2" 
          type="submit" 
          color="primary"
          :disabled="postPending"
          :loading="postPending"
        >
          Submit
        </UButton>
      </div>
    </UForm>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'
import { z } from 'zod'

const tokenStore = useTokenStore();
const config = useRuntimeConfig()
const router = useRouter()
const toasts = useToast()

const { API_V2_URL } = config.public
const schema = z.object({
  no_simrs: z.date(),
  no_surat: z.string(), // .min(1, "Nomor Surat tidak boleh kosong, jika tidak ada gunakan '-'"),
  perihal: z.string(), // .min(10, "Perihal Surat Harus diisi"),
  pengirim: z.string(), // .min(10, "Pengirim Surat Harus diisi"),
  tgl_surat: z.date(),
  pelaksanaan: z.date().nullable(),
  pelaksanaan_end: z.date().nullable(),
  tempat: z.string().nullable(),
  ket: z.enum(['wa', 'email', 'fisik', '-']),
  file: z.instanceof(File).refine((file) => file.size < 1024 * 1024 * 10, {
    message: 'File size must be less than 10MB',
  }).optional(),
})

type Schema = z.output<typeof schema>

// via
const via = [
  { label: 'Tidak Diketahui', value: '-' },
  { label: 'WhatsApp', value: 'wa' },
  { label: 'Email', value: 'email' },
  { label: 'Fisik', value: 'fisik' },
]

const { no_simrs, no_surat, perihal, pengirim, tgl_surat, pelaksanaan, pelaksanaan_end, tempat, ket, actionUrl } = defineProps<{
  no_simrs?: string | null
  no_surat?: string | null
  perihal?: string | null
  pengirim?: string | null
  tgl_surat?: string | null | undefined
  pelaksanaan?: string | null | undefined
  pelaksanaan_end?: string | null | undefined
  tempat?: string | null
  ket?: 'wa' | 'email' | 'fisik' | '-' | undefined | string

  actionUrl?: string
}>()

const state = reactive({
  no_simrs: no_simrs ? new Date(no_simrs) : new Date(),
  no_surat: no_surat || '-',
  perihal: perihal || '-', // undefined,
  pengirim: pengirim || '-', // undefined,
  tgl_surat: tgl_surat  && tgl_surat != '0000-00-00' ? new Date(tgl_surat) : undefined,
  pelaksanaan: pelaksanaan && pelaksanaan != '0000-00-00' ? new Date(pelaksanaan) : null,
  pelaksanaan_end: pelaksanaan_end && pelaksanaan_end != '0000-00-00' ? new Date(pelaksanaan_end) : null,
  tempat: tempat || "-",
  ket: ket || '-',
})

const keteranganVia = ref<'wa' | 'email' | 'fisik' | '-' | undefined | string>(state.ket)
const postPending = ref(false)


async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true

  let formData = new FormData()
  const data: any = {
    ...event.data,
    no_simrs: format(state.no_simrs, 'yyyy-MM-dd'),
    tgl_surat: state.tgl_surat ? format(state.tgl_surat, 'yyyy-MM-dd') : null,
    pelaksanaan: state.pelaksanaan ? format(state.pelaksanaan, 'yyyy-MM-dd') : null,
    pelaksanaan_end: state.pelaksanaan_end ? format(state.pelaksanaan_end, 'yyyy-MM-dd') : null,
    ket: keteranganVia.value,
  }

  // append data to formData with key 'data'
  for (const key in data) {
    formData.append(key, data[key])
  }

  // append file to formData with key 'file'
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput.files) {
    formData.append('file', fileInput.files[0])
  }
  
  const url = actionUrl ?? `${API_V2_URL}/surat/masuk`

  const {data: postData, pending, error} = await useFetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    body: formData,
  })

  if (error.value) {
    postPending.value = false;
    
    const errorMessage = error.value.data?.message || error.value.message;
    toasts.add({ title: 'Error', description: errorMessage, color: 'red' });
    console.error("POST DATA ERROR", error.value.data);

    return;
  }
  
  if (!pending.value) {
    postPending.value = false;
  }
  
  postPending.value = false;
  toasts.add({ title: 'Success', description: 'Surat masuk berhasil ditambahkan', color: 'green' });
  router.push('/surat/masuk');
}
</script>