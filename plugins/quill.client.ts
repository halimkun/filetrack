import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            quill: Quill
        }
    }

})
