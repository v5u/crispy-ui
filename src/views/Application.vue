<template>
<div>
<el-row :gutter="20">
  <el-col :span="4" v-for="(application, index) in applications" :key="index">
    <el-card shadow="hover">
        <router-link :to="{ name: 'env', params: {applicationId: application.id}}">{{ application.name }}</router-link>
        <el-button @click="deleteApplication(application)" type="danger" icon="el-icon-delete" circle></el-button>
    </el-card>      
  </el-col>
  <el-col :span="4">
    <el-card shadow="hover">
        新建应用
        <el-button @click="createApplication" type="primary" icon="el-icon-plus" circle></el-button>
    </el-card>        
  </el-col>
</el-row>
<br/>
<div>
  <el-pagination
    layout="prev, pager, next, sizes"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :page-sizes="[10, 50, 100]"
    :current-page="page.index"
    :page-size="page.size"
    :total="page.total">
  </el-pagination>
</div>
</div>
</template>

<script>
export default {
  data() {
    return {
      applications: [],
      page: {
        total: 0,
        size: 10,
        index: 1
      }
    };
  },
  mounted() {
    this.getApplications();
  },
  methods: {
    createApplication() {
      this.$prompt("请输入应用名称", "应用新建提示", {
        confirmButtonText: "创建",
        cancelButtonText: "取消",
        inputValidator(val) {
          if (val === "" || val === null) return false;
          if (val.length === 0) return false;
          if (val.length > 254) return false;

          return true;
        },
        inputErrorMessage: "应用名称格式不正确"
      })
        .then(({ value }) => {
          this.$ajax
            .post(`application`, {
              name: value
            })
            .then(res => {
              this.$message({
                type: "success",
                message: `应用 ${value} 创建成功`
              });
              this.getApplications();
            })
            .catch(res => {
              this.$message({
                type: "error",
                message: res.response.data.message
              });
            });
        })
        .catch(e => {
          e.message &&
            this.$message({
              type: "info",
              message: e.message
            });
        });
    },
    getApplications() {
      this.$ajax
        .get("application/page", {
          params: {
            pageIndex: this.page.index - 1,
            pageSize: this.page.size
          }
        })
        .then(res => {
          var data = res.data;
          this.applications = data.data;
          this.page.total = data.total;
          this.page.size = data.pageSize;
          this.page.index = data.pageIndex + 1;
        });
    },
    deleteApplication(application) {
      this.$prompt(`请输入应用名称 ${application.name}`, "应用删除确认", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        inputValidator(val) {
          return val === application.name;
        },
        inputErrorMessage: "应用名称不匹配"
      }).then(({ value }) => {
        this.$ajax
          .delete(`application/${application.id}`)
          .then(res => {
            this.$message({
              type: "success",
              message: `应用 ${application.name} 删除成功`
            });
            this.getApplications();
          })
          .catch(res => {
            this.$message({
              type: "error",
              message: res.response.data.message
            });
          });
      });
    },
    handleSizeChange(size) {
      this.page.size = size;
      this.getApplications();
    },
    handleCurrentChange(index) {
      this.page.index = index;
      this.getApplications();
    }
  }
};
</script>
<style scoped>
.el-card {
  margin-top: 10px;
}
</style>
