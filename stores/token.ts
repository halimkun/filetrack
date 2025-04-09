import { defineStore } from "pinia";
import { ref } from "vue";

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export const useTokenStore = defineStore('token', {
    persist: true,

    state: () => ({
        accessToken: ref<string | null>(null),
        refreshToken: ref<string | null>(null),
        expiresIn: ref<number | null>(null),
        tokenType: ref<string | null>(null),
    }),

    actions: {
        setData(payload: TokenData) {
            this.accessToken = payload.access_token;
            this.refreshToken = payload.refresh_token;
            this.expiresIn = payload.expires_in;
            this.tokenType = payload.token_type;
        },

        setAccessToken(token: string) {
            this.accessToken = token;
        },
        
        setRefreshToken(token: string) {
            this.refreshToken = token;
        },

        setExpiresIn(seconds: number) {
            this.expiresIn = seconds;
        },

        setTokenType(type: string) {
            this.tokenType = type;
        },

        clearData() {
            this.accessToken = null;
            this.refreshToken = null;
            this.expiresIn = null;
            this.tokenType = null;
        },
    }
});
