<template>
  <div class="app-container">
    <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">Configure Vulnerability Notification</el-button>
    <el-button class="filter-item" type="warning" icon="el-icon-magic-stick" @click="handleRun">Run Test</el-button>
    <el-dialog title="Configure Vulnerability Notification" :visible.sync="dialogFormVisible" width="45%">
      <el-form ref="dataForm" :model="avd_config" label-position="right" label-width="auto" style="width: 90%; margin-left: 20px;">
        <el-form-item label="Vulnerability Collection">
          <el-switch v-model="avd_config.switch" /><br>
          <font size="3px" color="#ff0000">
            <li>Enable Collection: Automatically collects vulnerability information every hour.</li>
            <li>Enable Notification: When new vulnerabilities are discovered, they will be immediately pushed to the group robot.</li>
          </font>
        </el-form-item>
        <el-form-item v-if="avd_config.switch" label="DingTalk Notification">
          <el-switch v-model="avd_config.dingding" />
        </el-form-item>
        <el-form-item v-if="avd_config.switch && avd_config.dingding" required label="Robot Webhook Address">
          <el-input v-model="avd_config.dingdingwh" type="textarea" autosize /><font size="3px" color="#ff0000">For the robot security settings, please set the custom keyword as: <strong>Vulnerability Alert</strong></font>
        </el-form-item>
        <el-form-item v-if="avd_config.switch" label="WeChat Work Notification">
          <el-switch v-model="avd_config.wecom" />
        </el-form-item>
        <el-form-item v-if="avd_config.switch && avd_config.wecom" required label="Robot Webhook Address">
          <el-input v-model="avd_config.wecomwh" type="textarea" autosize />
        </el-form-item>
        <el-form-item v-if="avd_config.switch" label="Feishu Notification">
          <el-switch v-model="avd_config.feishu" />
        </el-form-item>
        <el-form-item v-if="avd_config.switch && avd_config.feishu" required label="Robot Webhook Address">
          <el-input v-model="avd_config.feishuwh" type="textarea" autosize /><font size="3px" color="#ff0000">For the robot security settings, please set the custom keyword as: <strong>Vulnerability Alert</strong></font>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createData">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <el-table v-loading="listLoading" :data="avd_list" :default-sort="{ prop: 'avd_time', order: 'descending' }" border fit highlight-current-row style="width: 100%;">
      <el-table-column type="index" align="center" />
      <el-table-column prop="avd_id" label="AVD Number" sortable align="center" width="150" />
      <el-table-column prop="avd_name" label="Vulnerability Name" sortable align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <el-link type="primary" style="font-weight:bold" :href="row.avd_id_url" target="_blank"><i class="el-icon-view el-icon--left" />{{ row.avd_name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="avd_type" label="Vulnerability Type" sortable align="center" width="220" show-overflow-tooltip />
      <el-table-column prop="avd_stat" label="Vulnerability Status" sortable align="center" width="160" />
      <el-table-column prop="avd_time" label="Disclosure Time" sortable align="center" width="120" />
    </el-table>
  </div>

</template>

<script>
import { getAvdList, getAvdConfig, postAvdJob, postAvdRun } from '@/api/avd'
export default {
  data() {
    return {
      listLoading: false,
      dialogFormVisible: false,
      avd_config: { switch: false, wecom: false, dingding: false, feishu: false, wecomwh: '', dingdingwh: '', feishuwh: '' },
      avd_list: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleCreate() {
      this.listLoading = true
      getAvdConfig().then(response => {
        if (Object.keys(response.avd_config).length !== 0) {
          this.avd_config = response.avd_config
        }
        this.listLoading = false
        this.dialogFormVisible = true
      })
    },
    fetchData() {
      this.listLoading = true
      getAvdList().then(response => {
        this.avd_list = response.avd_list
        this.listLoading = false
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dialogFormVisible = false
          this.listLoading = true
          postAvdJob(this.avd_config).then(response => {
            this.fetchData()
            this.$message({
              message: response.data,
              type: 'success'
            })
          })
        }
      })
    },
    handleRun() {
      this.$confirm('This operation will immediately execute a vulnerability notification. Continue?', 'Prompt', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        postAvdRun().then(response => {
          this.fetchData()
          this.$message({
            message: response.data,
            type: 'success'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Operation cancelled.'
        })
      })
    }
  }
}
</script>