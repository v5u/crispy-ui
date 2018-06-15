<template>
<div>
    <MonacoEditor
    height="600"
    language="json"
    :code="code"
    :options="options"
    @mounted="onMounted"
    @codeChange="onCodeChange"
    >
</MonacoEditor>
</div>    
</template>

<script>
import MonacoEditor from "vue-monaco-editor";
export default {
  data() {
    return {
      options: {
        selectOnLineNumbers: false,
        theme:'vs'
      }
    };
  },
  methods: {
    onMounted(editor) {
      this.editor = editor;
    },
    onCodeChange(editor) {
      console.log(this.editor.getValue());
    }
  },
  components: {
    MonacoEditor
  }
};
</script>

<style>
.monaco-editor .view-line{
    width: auto !important;
}
</style>

