<template>
  <div class="app-container">
    <el-select v-model="services" multiple placeholder="Select MySQL groups for auto-discovery" filterable collapse-tags clearable
      style="width: 260px" class="filter-item">
      <el-option v-for="item in services_list" :key="item" :label="item" :value="item" />
    </el-select>
    <el-input v-model="exporter" placeholder="Mysqld_Exporter IP and port" clearable style="width: 200px;"
      class="filter-item" />&nbsp;&nbsp;
    <el-select v-model="jobrds" multiple placeholder="Select MySQL groups for metric collection" filterable collapse-tags clearable
      style="width: 260px" class="filter-item">
      <el-option v-for="item in jobrds_list" :key="item" :label="item" :value="item" />
    </el-select>
    <el-input v-model="cm_exporter" placeholder="TenSunS Web IP and port" clearable style="width: 190px;"
      class="filter-item" />&nbsp;&nbsp;
    <el-button class="filter-item" type="primary" icon="el-icon-magic-stick" @click="fetchRdsConfig">
      Generate Configuration
    </el-button>
    <el-button v-clipboard:copy="configs" v-clipboard:success="onCopy" v-clipboard:error="onError" class="filter-item"
      type="warning" icon="el-icon-document-copy">
      Copy Configuration
    </el-button>
    <pre v-highlightjs="configs" style="line-height:120%"><code class="yaml yamlcode" /></pre>
  </div>
</template>

<script>
import { getRdsServicesList, getRdsConfig, getJobRds } from '@/api/rds'
export default {
  data() {
    return {
      listLoading: false,
      services: [],
      jobrds: [],
      ostype: [],
      services_list: [],
      services_dict: {},
      jobrds_list: [],
      exporter: '',
      cm_exporter: '',
      configs: 'This feature is used to generate two Prometheus JOB configurations. After generation, please copy to your Prometheus configuration:\n\n1. Select accounts to synchronize, and Prometheus will automatically discover all MySQL instances under these accounts.\n\n2. Since Mysqld_Exporter cannot monitor cloud database CPU, memory, and disk usage, TenSunS has developed an Exporter function. Configure it to Prometheus to collect these metrics directly from cloud providers!\n   Select the RDS account regions you need to collect metrics from to generate the Prometheus JOB configuration.'
    }
  },
  created() {
    this.fetchRdsList()
  },
  methods: {
    onCopy() {
      this.$message({
        message: 'Copy successful!',
        type: 'success'
      })
    },
    onError() {
      this.$message.error('Copy failed!')
    },
    fetchRdsList() {
      this.listLoading = true
      getRdsServicesList().then(response => {
        this.services_list = response.services_list
        this.services_list.push('selfrds_exporter')
      })
      getJobRds().then(response => {
        this.jobrds_list = response.jobrds
      })
      this.listLoading = false
    },
    fetchRdsConfig() {
      this.listLoading = true
      this.services_dict.services_list = this.services
      this.services_dict.exporter = this.exporter
      this.services_dict.jobrds_list = this.jobrds
      this.services_dict.cm_exporter = this.cm_exporter
      getRdsConfig(this.services_dict).then(response => {
        this.configs = response.configs
        this.listLoading = false
      })
    }
  }
}
</script>
<style>
.yamlcode {
  font-family: 'Consolas';
}

pre {
  max-height: 640px;
  white-space: pre-wrap;
  overflow: auto;
}
</style>