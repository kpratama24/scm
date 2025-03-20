<template>
  <div class="app-container">
    <el-select v-model="jobrds_name" placeholder="Please select a Cloud MySQL list to query" filterable collapse-tags clearable style="width: 350px" class="filter-item" @change="fetchRds(jobrds_name)">
      <el-option v-for="item in jobrds_list" :key="item" :label="item" :value="item" />
    </el-select>
    <el-checkbox v-model="checked" style="margin-left: 10px;" label="Show only modified" border @change="cstRdsList(jobrds_name,checked)" />
    <el-tooltip effect="light" content="Refresh current RDS list" placement="top">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" circle @click="fetchEcs(jobrds_name)" />
    </el-tooltip>
    <div style="float: right;margin-left: 10px;">
      <el-input v-model="iname" prefix-icon="el-icon-search" placeholder="Enter name, instance or instance ID to filter" clearable style="width: 300px" class="filter-item" />
    </div>
    <el-dialog title="Custom Instance Information" :visible.sync="dialogFormVisible" width="45%">
      <el-form ref="dataForm" :model="cst_rds" label-position="right" label-width="auto" style="width: 90%; margin-left: 20px;">
        <el-form-item label="Custom Port">
          <el-switch v-model="cst_rds.portswitch" />
        </el-form-item>
        <el-form-item v-if="cst_rds.portswitch" required label="Port:">
          <el-input v-model="cst_rds.port" />
        </el-form-item>
        <el-form-item label="Custom IP">
          <el-switch v-model="cst_rds.ipswitch" />
        </el-form-item>
        <el-form-item v-if="cst_rds.ipswitch" required label="IP:">
          <el-input v-model="cst_rds.ip" />
        </el-form-item>
        <font size="3px" color="#ff0000">To restore synchronized IP and port information for this instance, turn off the enabled custom options, then synchronize the data source once more.</font>
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

    <el-table
      v-loading="listLoading"
      :data="rds_list.filter(data => !iname || (data.name.toLowerCase().includes(iname.toLowerCase()) || data.instance.toLowerCase().includes(iname.toLowerCase()) || data.iid.toLowerCase().includes(iname.toLowerCase())))"
      :default-sort="{ prop: 'exp', order: 'ascending' }"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="index" align="center" />
      <el-table-column prop="group" label="Group" sortable align="center" width="150" show-overflow-tooltip />
      <el-table-column prop="name" label="Name" sortable align="center" width="220" show-overflow-tooltip />
      <el-table-column prop="instance" label="Instance" sortable align="center" width="180">
        <template slot-scope="{row}">
          <span style="font-weight:bold">{{ row.instance }} </span>
          <el-tooltip style="diaplay:inline" effect="dark" placement="top">
            <div slot="content"> Domain: {{ row.domain }}</div>
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="ver" label="Version" sortable align="center" width="80" />
      <el-table-column prop="cpu" label="CPU" sortable align="center" width="80" />
      <el-table-column prop="mem" label="Memory" sortable align="center" width="80" />
      <el-table-column prop="disk" label="Disk" sortable align="center" width="80" />
      <el-table-column prop="exp" label="Expiry Date" sortable align="center" width="120" />
      <el-table-column prop="iid" label="Instance ID" sortable align="center" />
      <el-table-column label="Actions" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row.iid)">
            Customize Instance
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getResList, getJobRds, postCstRds, getCstRdsConfig, getCstRdsList } from '@/api/rds'
export default {
  data() {
    return {
      listLoading: false,
      dialogFormVisible: false,
      checked: false,
      jobrds_name: '',
      iname: '',
      jobrds_list: [],
      rds_list: [],
      cst_rds: { iid: '', portswitch: false, ipswitch: false, port: '', ip: '' }
    }
  },
  created() {
    getJobRds().then(response => {
      this.jobrds_list = response.jobrds
      if (this.$route.query.job_id) {
        this.fetchRds(this.$route.query.job_id)
      } else {
        this.jobrds_name = this.jobrds_list[0]
        this.fetchRds(this.jobrds_name)
      }
    })
  },
  mounted() {
    if (this.$route.query.job_id) {
      this.jobrds_name = this.$route.query.job_id
    }
  },
  methods: {
    cstRdsList(jobrds_name, checked) {
      this.listLoading = true
      getCstRdsList(jobrds_name, checked).then(response => {
        this.rds_list = response.res_list
        this.listLoading = false
      })
    },
    handleUpdate(iid) {
      this.listLoading = true
      this.dialogFormVisible = true
      getCstRdsConfig(iid).then(response => {
        this.cst_rds = response.cst_rds
        this.listLoading = false
        this.dialogFormVisible = true
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dialogFormVisible = false
          this.listLoading = true
          postCstRds(this.cst_rds).then(response => {
            this.fetchRds(this.jobrds_name)
            this.$message({
              message: response.data,
              type: 'success'
            })
          })
        }
      })
    },
    fetchJobRds() {
      getJobRds().then(response => {
        this.jobrds_list = response.jobrds
      })
    },
    fetchRds(job_id) {
      this.checked = false
      this.listLoading = true
      getResList(job_id).then(response => {
        this.rds_list = response.res_list
        this.listLoading = false
      })
    }
  }
}
</script>