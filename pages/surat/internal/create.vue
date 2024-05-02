<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="w-full">
    <div class="w-full flex flex-col lg:flex-row gap-4 mb-4 items-start">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-edit" color="indigo" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Surat Internal</h1>
            </div>
          </div>
        </template>

        <div class="flex items-start justify-start gap-4">
          <!-- Tanggal Terbit -->
          <UFormGroup label="Tanggal Terbit" name="tgl_terbit" class="w-full">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid" :label="format(tgl_terbit, 'd MMM, yyy')"
                :color="tgl_terbit ? 'primary' : 'gray'" variant="soft" />

              <template #panel="{ close }">
                <DatePicker v-model="tgl_terbit" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>

          <!-- Tanggal Kegiatan -->
          <UFormGroup label="Tanggal Kegiatan" name="tgl_kegiatan" class="w-full">
            <UPopover class="w-full" :popper="{ placement: 'bottom-start' }">
              <UButton block icon="i-heroicons-calendar-days-20-solid" :label="format(tanggal, 'd MMM, yyy HH:mm')"
                :color="tanggal ? 'cyan' : 'gray'" variant="soft" />

              <template #panel="{ close }">
                <DatePicker v-model="tanggal" mode="dateTime" is-required @close="close" />
              </template>
            </UPopover>
          </UFormGroup>
        </div>

        <div class="mt-4 space-y-3">
          <UFormGroup label="Tempat Kegiatan" name="tempat" class="w-full">
            <UInput v-model="state.tempat" placeholder="Tempat Kegiatan" color="gray" variant="outline" />
          </UFormGroup>

          <UFormGroup label="Penanggung Jawab" name="penanggung_jawab" class="w-full">
            <UInputMenu 
              v-model="state.pj" 
              :options="peep"
              option-attribute="nama"
              value-attribute="nik"
            />
          </UFormGroup>

          <UFormGroup label="Perihal" name="perihal" class="w-full">
            <UTextarea v-model="state.perihal" placeholder="Perihal Surat" color="gray" variant="outline" resize />
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

        <UTextarea v-model="state.catatan" placeholder="Catatan Surat" color="gray" variant="outline" resize />
      </UCard>
    </div>

    <UCard class="p-0">
      <div class="flex justify-end">
        <UButton icon="i-tabler-plus" size="xs" square type="submit">
          Tambah Surat
        </UButton>
      </div>
    </UCard>
  </UForm>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'
import { z } from 'zod'

const schema = z.object({
  tgl_terbit: z.date(),
  tanggal: z.date(),
  tempat: z.string().optional(),
  pj: z.string().min(10, "Penanggung Jawab harus dipilih"),
  perihal: z.string().min(10, "Perihal harus diisi"),
  catatan: z.string().optional(),
})

type Schema = z.output<typeof schema>

const peep = [
  { nik: "3.928.0623", nama: 'Faisal' },
  { nik: "3.928.0622", nama: 'Rizky' },
  { nik: "3.928.0621", nama: 'Rizal' },
]

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()
const tgl_terbit = ref(new Date())
const tanggal = ref(new Date())
const pj = ref<string>('3.928.0623')
const toasts = useToast()
const router = useRouter()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore

const state = reactive({
  tgl_terbit,
  tanggal,
  tempat: '-',
  pj: peep.find((p) => p.nik === pj.value)?.nik || '-',
  perihal: '',
  catatan: '-',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const data = {
    ...event.data,
    tgl_terbit: tgl_terbit.value.toISOString().split('T')[0],
    tanggal: tanggal.value.toISOString().split('.')[0].replace('T', ' '),
  }

  const { data: postData, pending, error } = await useFetch(`${API_V2_URL}/surat/internal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  })

  if (error.value) {
    console.error("POST DATA ERROR", error.value.data)
    toasts.add({ title: 'Error', description: error.value.data?.message || error.value.message, color: 'red' })
    return
  }

  // if pending
  if (pending.value) {
    toasts.add({ title: 'Pending', description: 'Menambahkan surat internal', color: 'gray' })
    return
  }

  toasts.add({ title: 'Success', description: 'Surat internal berhasil ditambahkan', color: 'green' })
  router.push('/surat/internal')
}

</script>