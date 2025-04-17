<template>
  <div class="flex gap-3">
    <div class="flex gap-3 flex-col max-w-sm min-w-[386px] w-full">
      <div class="p-6 bg-white rounded-lg w-full text-gray-800">
        <div class="space-y-3">
          <div class="space-y-0">
            <p class="font-semibold text-sm text-primary-600">Perihal</p>
            <p class="font-semibold text-base">{{ data?.data.perihal }}</p>
          </div> 

          <div class="space-y-0">
            <p class="font-semibold text-sm text-primary-600">Tanggal Kegiatan</p>
            <p class="font-semibold text-base">
              <template v-if="data?.data.tanggal">
                {{ new Date(data?.data.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                }) }}
              </template>
            </p>
          </div>

          <div class="space-y-0">
            <p class="font-semibold text-sm text-primary-600">Lokasi Kegiatan</p>
            <p class="font-semibold text-base">{{ data?.data.lokasi }}</p>
          </div>

          <div class="space-y-0">
            <p class="font-semibold text-sm text-primary-600">Dibuat Pada</p>
            <p class="font-semibold text-base">
              <template v-if="data?.data.created_at">
                {{ new Date(data?.data.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                }) }}
              </template>
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-lg w-full text-gray-800">
        <div class="space-y-0">
          <p class="font-semibold text-sm text-primary-600">Catatan</p>
          <p class="font-semibold text-base">{{ data?.data.catatan ?? "-" }}</p>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white rounded-lg text-gray-700 max-w-md w-full">
      <div class="py-3 px-4 border-2 text-gray-900 rounded-lg w-full mb-4 flex items-center gap-3">
        <UButton icon="i-tabler-arrow-back" color="teal" square variant="soft" @click="router.back()" />
        <div class="flex flex-col">
          <strong class="text-primary-600 p-0 m-0">Kembali ke aplikasi</strong>
          <p class="text-sm p-0 m-0">QR Code kehadiran | <strong>RSIA Aisyiyah Pekajangan</strong></p>
        </div>
      </div>

      <div class="w-full flex items-center justify-center">
        <!-- QR Code -->
        <template v-if="status === 'success'">
          <ClientOnly fallback="Loading QR Code...">
            <qrcode-vue :value="data?.data.qr?.content" :size="375" level="H" />
          </ClientOnly>
        </template>

        <template v-else-if="status === 'pending'">
          <div class="w-[375px] h-[375px] bg-gray-100 animate-pulse rounded-lg"></div>
        </template>
      </div>

      <!-- Info -->
      <div class="flex flex-col items-center justify-center text-gray-900 mt-6">
        <strong class="text-xl leading-none">Scan QR Code</strong>
        <p class="p-0 m-0">Untuk konfirmasi kehadiran</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import QrcodeVue from 'qrcode.vue'
import type { UndanganWithDeganQr } from '~/types/undangan.types';
import { logEvent } from '~/utils/firebase'

const undanganId = ref<string | null>(null)

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const token = useTokenStore();

onMounted(() => {
  undanganId.value = route.params.id as string;
})

const { data, status, error } = useFetch<UndanganWithDeganQr>(() => `${config.public.API_V2_URL}/undangan/${undanganId.value}/qr`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token.accessToken}`
  },
  watch: [undanganId],
  immediate: true
})

watch(status, (newStatus) => {
  if (newStatus === 'error') {
    logEvent('qr_page_error', {
      id: undanganId.value,
      error: error.value
    })
    // router.back()
  } else if (newStatus === 'success') {
    logEvent('qr_page_view', {
      id: undanganId.value,
      data: data.value
    })
  }
})

definePageMeta({
  title: 'Login',
  layout: 'auth'
})
</script>
