<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-tag-starred" color="lime" size="xs" square variant="soft" />
            <h1 class="text-lg">Update Status Surat</h1>
          </div>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Status" required class="flex flex-col" name="status">
          <USelectMenu :options="options" placeholder="Pilih Status" searchable v-model="state.status"
            searchable-placeholder="Cari Status" option-attribute="label" value-attribute="value"
            :search-attributes="['value', 'label', 'colors']" size="lg">
            <template #option="{ option: status }">
              <span v-for="color in status.colors" :key="color.id" class="h-2 w-2 rounded-full" :class="`bg-${color}-500 dark:bg-${color}-400`" />
              <span class="truncate">{{ status.label }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>

        <div class="mt-4 flex justify-end">
          <UButton color="lime" icon="i-tabler-check" label="Update" type="submit"/>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import { logEvent } from '~/utils/firebase'
import type { FormSubmitEvent } from '#ui/types'
import type { SuratInternalData } from '~/types/SuratInternal';

const toast = useToast();
const router = useRouter();
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const accessToken = accessTokenStore.accessToken

const props = defineProps<{
  suratInternal: SuratInternalData | null | undefined;
  showModalUpdateStatus: boolean;
}>();

watch(() => props.suratInternal, (data) => {
  state.status = data?.status ?? 'pengajuan'
});

const options = [
  { value: 'pengajuan', label: 'Pengajuan', colors: ['sky'] },
  { value: 'disetujui', label: 'Disetujui', colors: ['green'] },
  { value: 'ditolak', label: 'Ditolak', colors: ['yellow'] },
  { value: 'batal', label: 'Batal', colors: ['red'] },
]

const schema = z.object({
  status: z.enum(['pengajuan', 'disetujui', 'ditolak', 'batal'])
})

type Schema = z.output<typeof schema>

const state = reactive({
  status: props.suratInternal?.status ?? 'pengajuan'
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const postData = {
    status: event.data.status,
    no_surat: props.suratInternal?.no_surat,
    perihal: props.suratInternal?.perihal,
    tempat: props.suratInternal?.tempat,
    pj: props.suratInternal?.pj,
    tgl_terbit: props.suratInternal?.tgl_terbit,
    tanggal: props.suratInternal?.tanggal,
    catatan: props.suratInternal?.catatan,
  }

  const { data, pending, error, refresh, status } = await useFetch(`${API_V2_URL}/surat/internal/${btoa(props.suratInternal?.no_surat as string)}?_method=PUT`,{
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(postData)
  })

  if (error.value) {
    logEvent('update_status_surat', { status: 'failed', error: error.value.message })
    toast.add({ title: 'Gagal', description: error.value.message, color: 'red' })
  }

  if (status.value == 'success') {
    logEvent('update_status_surat', { status: 'success', data: postData, response: data })
    toast.add({ title: 'Berhasil', description: 'Status surat berhasil diperbarui', color: 'green' })

    setTimeout(() => {
      router.push(`/surat/internal/${btoa(props.suratInternal?.no_surat as string)}`)
    }, 1200)
  }
}
</script>