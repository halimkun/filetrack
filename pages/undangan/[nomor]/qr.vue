<template>
  <div class="p-6 bg-white rounded-lg">
    <div class="py-3 px-4 border-2 text-gray-900 rounded-lg w-full mb-4 flex items-center gap-3">
      <UButton icon="i-tabler-arrow-back" color="teal" square variant="soft" @click="router.back()" />
      <div class="flex flex-col">
        <strong class="text-primary p-0 m-0">Kembali ke aplikasi</strong>
        <p class="text-sm p-0 m-0">QR Code kehadiran | <strong>RSIA Aisyiyah Pekajangan</strong></p>
      </div>
    </div>

    <!-- QR Code -->
    <ClientOnly>
      <qrcode-vue :value="decodedNomor" size="380" level="H" />
    </ClientOnly>

    <!-- Info -->
     <div class="flex flex-col items-center justify-center text-gray-900 mt-6">
      <strong class="text-xl">Scan QR Code</strong>
      <p class="p-0 m-0">Untuk konfirmasi kehadiran</p>

      <div class="mt-6">
        <p class="text-sm text-sky-500 font-bold">
          RSIA Aisyiyah Pekajangan
        </p>
      </div>
     </div>
  </div>
</template>

<script lang="ts" setup>
import QrcodeVue from 'qrcode.vue'

const route = useRoute();
const router = useRouter();

const decodedNomor = atob(route.params.nomor as string)

definePageMeta({
  title: 'Login',
  layout: 'auth'
})
</script>