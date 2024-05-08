<template>
  <div class="flex w-full xl:w-[40%]">
    <UCard class="w-full">
      <template #header>
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-edit" color="indigo" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg capitalize">Buat Nomor Berkas Komite {{ komite }}</h1>
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

        <!-- method on action url == put or patch -->
        <template v-if="actionUrl && actionUrl.includes('_method=PUT') || actionUrl && actionUrl.includes('_method=PATCH')">
          <UFormGroup label="Nomor Surat" name="nomor" class="w-full mb-4" hint="Nomor Surat tidak dapat diubah">
            <UInput variant="outline" color="gray" :value="[nomor, prefix, format(new Date(tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/')" readonly />
          </UFormGroup>

          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full mb-4" hint="Tanggal Terbit tidak dapat diubah">
            <UInput variant="outline" color="gray" :value="new Date(tgl_terbit.replace(' ', 'T').split('.')[0]).toLocaleDateString('id-ID', { 
              weekday: 'long', year: 'numeric', 
              month: 'long', day: 'numeric'
            })" readonly />
          </UFormGroup>
        </template>
        
        <template v-else>
          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full mb-4">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid" :label="format(state.tgl_terbit, 'd MMM, yyy')"
                :color="state.tgl_terbit ? 'primary' : 'rose'" variant="soft" />

              <template #panel="{ close }">
                <DatePicker v-model="state.tgl_terbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>
        </template>

        <UFormGroup label="Perihal Surat" name="perihal" class="w-full mb-4">
          <UInput v-model="state.perihal" placeholder="Perihal Surat" variant="outline" />
        </UFormGroup>

        <div class="mt-10 flex justify-end">
          <!-- template if contain put / patch -->
          <template v-if="actionUrl && actionUrl.includes('_method=PUT') || actionUrl && actionUrl.includes('_method=PATCH')">
            <UButton type="submit" color="green" :loading="postPending" :disabled="postPending" icon="i-tabler-check" label="Update" />
          </template>

          <!-- template if contain post -->
          <template v-else>
            <UButton type="submit" color="green" :loading="postPending" :disabled="postPending" icon="i-tabler-check" label="Submit" />
          </template>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'
import { z } from 'zod'

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()
const router = useRouter()
const toasts = useToast()

const { komite, pj, perihal, tgl_terbit, nomor, prefix, actionUrl } = defineProps<{
  komite: string

  pj?: string | null | undefined
  perihal?: string | null | undefined
  tgl_terbit?: Date | null | undefined

  nomor?: string | int | null | undefined
  prefix?: string | null | undefined
  actionUrl?: string
}>()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore

const postPending = ref(false)

type Schema = z.output<typeof schema>
const schema = z.object({
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
  perihal: z.string(),
  tgl_terbit: z.date(),
})

const state = reactive({
  pj: pj || undefined,
  perihal: perihal || undefined,
  tgl_terbit: tgl_terbit ? new Date(tgl_terbit) : new Date(),
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  postPending.value = true
  const data = {
    ...event.data,
    tgl_terbit: format(state.tgl_terbit, 'yyyy-MM-dd'),
  };

  if (nomor) {
    data.nomor = nomor
  }

  const url = actionUrl || `${API_V2_URL}/berkas/komite/${komite}`

  const { data: postData, pending, error, refresh, status } = await useFetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })

  if (error.value) {
    toasts.add({
      title: 'Error',
      description: 'Terjadi kesalahan saat membuat Berkas Komite',
      color: 'red'
    })
  }

  if (status.value === 'success') {
    toasts.add({
      title: 'Success',
      description: 'Berkas Komite berhasil dibuat',
      color: 'green'
    })
    router.push(`/berkas/komite/${komite}`)
  } else {
    toasts.add({
      title: 'Error',
      description: 'Gagal membuat Berkas Komite',
      color: 'red'
    })
    console.error("POST DATA ERROR", error.value.data)
  }
}
</script>