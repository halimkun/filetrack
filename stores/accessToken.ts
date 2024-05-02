import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccessTokenStore = defineStore('accessToken', {
  state() {
    return {
      accessToken: ref<any>()
    }
  },

  actions: {
    setToken(token: string | null) {
      this.accessToken = token;
    },

    clearToken() {
      this.accessToken = '';
    }
  },

  persist: true
});