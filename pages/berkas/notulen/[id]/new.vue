<template>
  <div>
    <ButtonBack class="mb-3" title="Berkas Notulen" subtitle="Buat notulen kegiatan" borderColor="gray" width="full" />

    <div class="flex flex-col-reverse xl:flex-row items-start gap-3">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-edit" color="sky" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Notulen</h1>
            </div>
          </div>
        </template>
      </UCard>

      <UCard class="w-full xl:w-[35%]">
        <template #header>
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-pin-filled" color="sky" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Detail Kegiatan</h1>
            </div>
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <!-- <div class="flex gap-3">
            <div class="w-full">
              <p class="text-sm text-cool-400">id Surat</p>
              <p class="text-base font-bold">{{ id }}</p>
            </div>
          </div> -->
          <div class="flex gap-3">
            <div class="w-1/3">
              <p class="text-sm text-cool-400">Tanggal Kegiatan</p>
              <p class="text-base font-bold">12/12/2021</p>
            </div>
            <div class="w-2/3">
              <p class="text-sm text-cool-400">Tempat Kegiatan</p>
              <p class="text-base font-bold">Gedung Serba Guna</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-1/3">
              <p class="text-sm text-cool-400">Tanggal Notulen</p>
              <p class="text-base font-bold">12/12/2021</p>
            </div>
            <div class="w-2/3">
              <p class="text-sm text-cool-400">Pembuat Notulen</p>
              <!-- <p class="text-base font-bold">{{ userDetail.user.detail.nama }}</p> -->
            </div>
          </div>
          <div class="w-full">
            <p class="text-sm text-cool-400">Catatan</p>
            <p class="text-base font-bold">-</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>

const route = useRoute();
const router = useRouter();

const id = ref(route.params.id);
</script>