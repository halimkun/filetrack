<template>
  <div class="bg-white rounded-xl w-full overflow-hidden text-dark">
    <MenuBar :editor="editor" />
    <div class="px-3 pb-3">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

import MenuBar from '~/components/EditorUtils/MenuBar.vue'

export default {
  components: {
    MenuBar,
    EditorContent,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    modelValue(value) {
      // HTML
      const isSame = this.editor.getHTML() === value

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      content: this.modelValue,
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose mx-auto mx-2 mb-1 mt-3 focus:outline-none prose-ul:leading-3 prose-hr:my-3 prose-hr:mb-6',
        },
      },
      onUpdate: () => {
        // HTML
        this.$emit('update:modelValue', this.editor.getHTML())

        // JSON
        // this.$emit('update:modelValue', this.editor.getJSON())
      },
    })
  },
}
</script>