<template>
<div>
    <el-row :gutter="20">
        <el-col :span="6">
            <span class="grid-content bg-purple">{{ application.name }}</span>
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="updateApplication"></el-button>
        </el-col>
        <el-col :span="6">
            <div class="grid-content bg-purple">
                启用状态：
                <el-switch
                v-model="application.enabler"
                @change="enableApplication"
                active-color="#13ce66"
                inactive-color="#ff4949">
                </el-switch>                
            </div>
        </el-col>
        <el-col :span="6">
            <div class="grid-content bg-purple">
                数据加密：
                <el-switch
                v-model="application.encryption"
                @change="encryptApplication"
                active-color="#13ce66"
                inactive-color="#ff4949">
                </el-switch>                
            </div>
        </el-col>
        <el-col :span="6">
            <div class="grid-content bg-purple">
                引入全局配置：
                <el-switch
                v-model="application.includeGlobalConfig"
                @change="includeGlobalConfigApplication"
                active-color="#13ce66"
                inactive-color="#ff4949">
                </el-switch>                
            </div>
        </el-col>                        
    </el-row>

    <el-row>
      <el-col :span="24">
        <div>
            <el-select v-model="environment.id" filterable 
            placeholder="请选择" size="mini" @change="handleEnvironmentChange"
            style="width: 100px;">
                <el-option
                v-for="env in application.environments"
                :key="env.item1"
                :label="env.item2"
                :value="env.item1">
                </el-option>
            </el-select>
            <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addEnvironment"></el-button>
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="updateEnvironment"></el-button>
            <el-button type="danger" icon="el-icon-minus" circle size="mini" @click="removeEnvironment(environment.name)"></el-button>
            环境启用状态：
            <el-switch
            v-model="environment.enabler"
            @change="enableEnvironment"
            active-color="#13ce66"
            inactive-color="#ff4949">
            </el-switch>&nbsp;&nbsp;
            <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addKeyValuePair">添加配置</el-button>
        </div>          
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="22">
        <el-table
            :data="environment.keyValuePairs"
            style="width: 100%"
            :fit="true">

            <el-table-column
            label="key" header-align="center"
            width="200">
            <template slot-scope="scope">
                <span style="margin-left: 10px" :title="scope.row.description">{{ scope.row.key }}</span>
            </template>
            </el-table-column>

            <el-table-column
            label="value" header-align="center"
            width="200">
            <template slot-scope="scope">
                <el-popover trigger="hover" placement="top">
                {{ scope.row.value }}
                <div slot="reference" class="name-wrapper">
                    <el-tag size="medium">鼠标悬浮查看</el-tag>
                </div>
                </el-popover>
            </template>
            </el-table-column>

            <el-table-column
            label="状态(点击修改)" header-align="center"
            width="200">
            <template slot-scope="scope">
                <el-tag size="medium">{{ scope.row.enabler ? '已启用' : '已禁用' }}</el-tag>
            </template>
            </el-table-column>          
            
            <el-table-column
            label="上次修改时间" header-align="center"
            width="200">
            <template slot-scope="scope">
                {{ scope.row.timestamp }}
            </template>
            </el-table-column>                

            <el-table-column label="操作" header-align="center" width="220">
            <template slot-scope="scope">
                <el-button
                size="mini"
                @click="updateKeyValuePair(scope.row)">编辑</el-button>
                <el-button
                size="mini"
                type="info"
                @click="getKeyValuePairHistories(scope.row)">历史</el-button>
                <el-button
                size="mini"
                type="danger"
                @click="removeKeyValuePair(scope.row.id, scope.row.key)">删除</el-button>
            </template>
            </el-table-column>

        </el-table>              
      </el-col>
      <el-col :span="2">&nbsp;</el-col>
    </el-row>

  <el-dialog :title="isAdd ? '添加配置' : '修改配置'" :visible.sync="dialogFormVisible" :fullscreen="true">
    <el-form :model="form" :rules="formRules" ref="form" :label-position="'right'">
      <el-form-item label="Key" :label-width="formLabelWidth" prop="key">
        <el-input v-model="form.key" :disabled="!isAdd" clearable></el-input>
      </el-form-item>
      <el-form-item label="Value" :label-width="formLabelWidth" prop="value">
        <el-input type="textarea" v-model="form.value"></el-input>      
      </el-form-item>
      <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
        <el-input type="textarea" v-model="form.description"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="addOrUpdateKeyValuePair">{{ isAdd?'添加':'修改' }}</el-button>
    </div>
  </el-dialog>

<el-dialog title="配置历史记录" :visible.sync="dialogTableVisible">
  <el-table :data="keyValuePairHistories" v-loading="keyValuePairHistoriesLoading" align="left">
    <el-table-column property="value" label="Value" width="150"></el-table-column>
    <el-table-column property="dateTimeCreated" label="创建时间" width="200"></el-table-column>
    <el-table-column label="操作" width="200" align="left">
      <template slot-scope="scope">        
        <el-button
        v-if="scope.$index!=0"
        size="mini"
        type="primary"
        @click="revertKeyValuePairHistories(scope.row)" align="left">回退</el-button>
      </template>
    </el-table-column>
  </el-table>
</el-dialog>

</div>
</template>
<script>
export default {
  data() {
    return {
      application: {},
      environment: {},
      keyValuePairHistories: [],
      dialogFormVisible: false,
      dialogTableVisible: false,
      keyValuePairHistoriesLoading: true,
      isAdd: true,      
      form: {
        environmentId: null,
        id: null,
        key: "",
        value: "",
        description: ""
      },
      formRules: {
        key: [
          {
            requird: true,
            message: "Key 不能为空",
            trigger: "blur"
          },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
        ],
        value: [
          {
            min: 1,
            max: 1280,
            message: "长度在 1 到 1280 个字符",
            trigger: "blur"
          }
        ],
        description: [
          {
            min: 1,
            max: 1280,
            message: "长度在 1 到 1280 个字符",
            trigger: "blur"
          }
        ]
      },
      formLabelWidth: "80px"
    };
  },
  mounted() {
    this.application.id = this.$route.params.applicationId;
    this.getApplication();
  },
  methods: {
    getApplication() {
      this.$ajax.get(`application/${this.application.id}`).then(res => {
        this.application = res.data;
        this.environment.id = this.application.environments[0].item1;
        this.getEnvironment();
      });
    },
    updateApplication() {
      this.$prompt("请输入应用名称", "应用名称修改提示", {
        confirmButtonText: "修改",
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
            .patch(`application`, {
              id: this.application.id,
              name: value
            })
            .then(res => {
              this.application.name = value;

              this.$message({
                type: "success",
                message: `应用名称 ${value} 修改成功`
              });
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
    enableApplication(val) {
      this.$ajax.patch(`/application/${this.application.id}/enabler/${val}`);
    },
    encryptApplication(val) {
      this.$ajax.patch(`/application/${this.application.id}/encryption/${val}`);
    },
    includeGlobalConfigApplication(val) {
      this.$ajax.patch(
        `/application/${this.application.id}/includeglobalconfig/${val}`
      );
    },
    getEnvironment() {
      this.$ajax.get(`environment/${this.environment.id}`).then(res => {
        this.environment = res.data;
        this.form.environmentId = res.data.id;
      });
    },
    updateEnvironment() {
      this.$prompt("请输入环境名称", "环境名称修改提示", {
        confirmButtonText: "修改",
        cancelButtonText: "取消",
        inputValidator(val) {
          if (val === "" || val === null) return false;
          if (val.length === 0) return false;
          if (val.length > 254) return false;

          return true;
        },
        inputErrorMessage: "环境名称格式不正确"
      })
        .then(({ value }) => {
          this.$ajax
            .patch(`environment`, {
              id: this.environment.id,
              name: value
            })
            .then(res => {
              this.$message({
                type: "success",
                message: `环境 ${value} 更新成功`
              });
              this.getApplication();
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
    addEnvironment() {
      this.$prompt("请输入环境名称", "环境新增提示", {
        confirmButtonText: "新增",
        cancelButtonText: "取消",
        inputValidator(val) {
          if (val === "" || val === null) return false;
          if (val.length === 0) return false;
          if (val.length > 254) return false;

          return true;
        },
        inputErrorMessage: "环境名称格式不正确"
      })
        .then(({ value }) => {
          this.$ajax
            .post(`environment`, {
              applicationId: this.application.id,
              name: value
            })
            .then(res => {
              this.$message({
                type: "success",
                message: `环境 ${value} 新增成功`
              });
              this.getApplication();
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
    removeEnvironment(environmentName) {
      this.$prompt(`请输入环境名称 ${environmentName}`, "环境移除确认", {
        confirmButtonText: "移除",
        cancelButtonText: "取消",
        inputValidator(val) {
          return val === environmentName;
        },
        inputErrorMessage: "环境名称不匹配"
      }).then(({ value }) => {
        this.$ajax
          .delete(`environment/${this.environment.id}`)
          .then(res => {
            this.$message({
              type: "success",
              message: `环境 ${this.environment.name} 移除成功`
            });
            this.getApplication();
          })
          .catch(res => {
            this.$message({
              type: "error",
              message: res.response.data.message
            });
          });
      });
    },
    enableEnvironment(val) {
      this.$ajax.patch(`/environment/${this.environment.id}/enabler/${val}`);
    },
    addKeyValuePair() {
      this.isAdd = true;
      this.form.id = null;
      this.form.key = "";
      this.form.value = "";
      this.form.description = "";
      this.dialogFormVisible = true;
    },
    updateKeyValuePair(row) {
      this.isAdd = false;
      this.form.id = row.id;
      this.form.key = row.key;
      this.form.value = row.value;
      this.form.description = row.description;
      this.dialogFormVisible = true;
    },
    addOrUpdateKeyValuePair() {
      if (this.form.id) {
        this.$ajax.patch(`keyvaluepair`, this.form).then(res => {
          this.$message({
            type: "success",
            message: `配置 ${this.form.key} 修改成功`
          });
          this.dialogFormVisible = false;
          this.getEnvironment();
        });
      } else {
        this.$ajax.post(`keyvaluepair`, this.form).then(res => {
          this.$message({
            type: "success",
            message: `配置 ${this.form.key} 添加成功`
          });
          this.dialogFormVisible = false;
          this.getEnvironment();
        });
      }
    },
    removeKeyValuePair(id, key) {
      this.$prompt(`请输入配置 Key ${key}`, "配置移除确认", {
        confirmButtonText: "移除",
        cancelButtonText: "取消",
        inputValidator(val) {
          return val === key;
        },
        inputErrorMessage: "配置 Key 不匹配"
      }).then(({ value }) => {
        this.$ajax
          .delete(`keyvaluepair/${id}`)
          .then(res => {
            this.$message({
              type: "success",
              message: `配置 ${key} 移除成功`
            });
            this.getEnvironment();
          })
          .catch(res => {
            this.$message({
              type: "error",
              message: res.response.data.message
            });
          });
      });
    },
    getKeyValuePairHistories(row) {
      this.form.id = row.id;
      this.form.key = row.key;
      this.form.description = row.description;

      this.dialogTableVisible = true;
      this.keyValuePairHistoriesLoading = true;
      this.$ajax.get(`keyvaluepair/${row.id}/histories`).then(res => {
        this.keyValuePairHistoriesLoading = false;
        this.keyValuePairHistories = res.data;
      });
    },
    revertKeyValuePairHistories(row) {
      this.$confirm("此操作将回退配置, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.form.value = row.value;
          this.dialogTableVisible = false;
          this.addOrUpdateKeyValuePair();
        })
        .catch(e => {
          e.message &&
            this.$message({
              type: "info",
              message: e.message
            });
        });
    },
    handleEnvironmentChange(val) {
      this.environment.id = val;
      this.form.environmentId = val;
      this.getEnvironment();
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    }
  }
};
</script>

<style>
table {
  margin: 0 auto;
}
</style>
