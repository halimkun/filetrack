<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-heroicons-arrow-up-tray-20-solid" color="amber" size="xs" square variant="soft" />
            <h1 class="text-lg">Upload Berkas SK</h1>
          </div>
        </div>
      </template>

      <ClientOnly fallback-tag="span" fallback="Loading comments...">
        <UForm :state="state" @submit="handleSubmit">
          <UFormGroup label="File" required name="file">
            <UInput type="file" v-model="state.berkas" :required="true"/>
          </UFormGroup>
  
          <div class="mt-8 flex justify-end">
            <UButton icon="i-tabler-send-2" type="submit" color="primary">
              Submit
            </UButton>
          </div>
        </UForm>
      </ClientOnly>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import type { SuratKeputusan } from '~/types/Sk';
import { z } from 'zod';

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()
const router = useRouter()
const toasts = useToast()

const { API_V2_URL } = config.public;
const accessToken: string | null = accessTokenStore.accessToken;

type Schema = z.output<typeof schema>
const schema = z.object({
  berkas: z.string().nonempty('Berkas harus diisi'),
})

const props = defineProps<{
  selectedSk: SuratKeputusan
}>()

const selectedSk = ref<SuratKeputusan>(props.selectedSk)
watch(() => props.selectedSk, (newValue) => {
  selectedSk.value = newValue

  // upate reactive state
  state.selectedSk = newValue
})

const state = reactive({
  isLoading: false,
  selectedSk: selectedSk.value,
  berkas: selectedSk?.value?.berkas
})

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  let data = new FormData()
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

  const postData: any = {
    ...state.selectedSk,
  }
  console.log("🚀 ~ handleSubmit ~ postData:", postData['jenis'])

  const { nomor, jenis, tgl_terbit } = postData
  const identifier = btoa([nomor, jenis, tgl_terbit].join('.'))

  data.append('file', fileInput.files![0])
  for (const key in postData) {    
    data.append(key, postData[key])
  }


  try {
    state.isLoading = true
    const { data: response, error, status } = await useFetch(`${API_V2_URL}/berkas/sk/${identifier}?_method=PUT`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data
    })

    if (error.value) {
      console.error(error.value)
      toasts.add({ title: 'Error', description: error.value.message, color: 'red' })
      return
    }

    if (status.value == 'success') {
      toasts.add({ title: 'Success', description: 'Berkas berhasil diupload', color: 'green' })
      router.go(0)
    }
  } catch (error) {
    console.error(error)
    toasts.add({ title: 'Error', description: "Terjadi kesalahan saat mengupload berkas", color: 'red' })
  } finally {
    state.isLoading = false
  }
}
</script>
