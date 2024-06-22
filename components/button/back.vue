<template>
  <div :class="`p-3 px-4 shadow rounded-lg bg-gray-900 w-${width ?? 'fit'}`">
    <div class="flex items-center justify-start gap-3">
      <UButton icon="i-tabler-arrow-back-up" @click="router.back()" :color="contentColor ?? 'gray'" :variant="variant ?? 'solid'" :size="buttonSize ?? 'lg'" />

      <div class="flex flex-col mr-10">
        <Strong :class="`font-bold m-0 p-0 leading-5 dark:text-${contentColor ?? 'gray'}-400 text-${contentColor ?? 'gray'}-600`">{{ title }}</Strong>
        <p :class="`m-0 p-0 leading-5 dark:text-${contentColor ?? 'gray'}-400 text-${contentColor ?? 'gray'}-600`">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();

const { title, subtitle, variant, buttonSize, contentColor, width } = defineProps<{
  title: string;
  subtitle: string;
  variant?: any;
  buttonSize?: any;
  contentColor?: string;
  width?: 'fit' | 'full';
}>();
</script>