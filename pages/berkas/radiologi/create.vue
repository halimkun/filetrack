<template>
  <FormBerkasLain 
    :komite="lastSegmentParent"
  />
</template>

<script lang="ts" setup>
const route = useRoute()
const lastSegmentParent = route.fullPath.split('/').slice(-2)[0]
</script>