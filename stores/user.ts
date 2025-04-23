import { defineStore } from "pinia";
import { ref } from "vue";

interface User {
  id_user: string;
  detail: {
    nik: string;
    nama: string;
    alamat: string;
    jk: string;
    jbtn: string;
    departemen: string;
  };
}

export const useUserStore = defineStore('user', {
  state() {
    return {
      user: ref<User | null>(null)
    }
  },

  actions: {
    setUser(user: User | null) {
      this.user = user;
    },

    updateUser(user: User) {
      this.clearUser();
      this.setUser(user);
    },

    clearUser() {
      this.user = null;
    }
  },

  persist: true
});