<template>
  <el-row>
    <el-col :span="24">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="password" placeholder="输入口令"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-arrow-right" @click="authentication"></el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data(){
    return {
      password: ''
    }
  },
  methods: {
    authentication(){
      this.$ajax.post('authentication', this.password).then(x=>{
        console.log('ok')
      });
    }
  }
}
</script>

<style scoped>

</style>

