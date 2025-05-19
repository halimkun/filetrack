<template>
  <UModal v-bind="$attrs">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-heroicons-arrow-up-tray-20-solid" color="amber" size="xs" square variant="soft" />
            <h1 class="text-lg">Upload Berkas PKS</h1>
          </div>
        </div>
      </template>

      <ClientOnly fallback-tag="span" fallback="Loading comments...">
        <UForm :state="state" @submit="handleSubmit">
          <p class="mb-3 text-sm text-gray-400">
            Hati-hati dalam mengupload berkas, jika berkas <strong class="text-primary">sudah diupload</strong>, berkas lama akan <u>tergantikan dengan berkas baru (hapus berkas lama)</u>, dan <b><u>tidak bisa dikembalikan lagi</u></b>.
            Pastikan untuk melakukan pengecekan berkas sebelum mengupload.
          </p>

          <UFormGroup label="File" required name="file">
            <UInput type="file" :required="true" />
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
import type { BerkasPksData } from '~/types/BerkasPks';
import { z } from 'zod';

const tokenStore = useTokenStore();
const config = useRuntimeConfig()
const router = useRouter()
const toasts = useToast()

const { API_V2_URL } = config.public;
type Schema = z.output<typeof schema>
const schema = z.object({
  berkas: z.string().nonempty('Berkas harus diisi'),
})

const props = defineProps<{
  selectedPks: BerkasPksData
}>()

const selectedPks = ref<BerkasPksData>(props.selectedPks)
watch(() => props.selectedPks, (newValue) => {
  selectedPks.value = newValue

  // upate reactive state
  state.selectedPks = newValue
})

const state = reactive({
  isLoading: false,
  selectedPks: selectedPks.value,
  berkas: selectedPks?.value?.berkas ?? '',
})

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  let data = new FormData()
  
  const postData: any = {
    ...state.selectedPks,
  }
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  data.append('file', fileInput.files![0])
  
  for (const key in postData) {    
    data.append(key, postData[key])
  }


  try {
    state.isLoading = true
    const { data: response, error, status } = await useFetch(`${API_V2_URL}/berkas/pks/${state.selectedPks.id}?_method=PUT`,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenStore.accessToken}`,
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