<template>
  <div class="app-container">
    <el-select v-model="services" multiple placeholder="Services Name" filterable collapse-tags clearable style="width: 300px" class="filter-item">
      <el-option v-for="item in services_list" :key="item" :label="item" :value="item" />
    </el-select>&nbsp;&nbsp;
    <el-select v-model="ostype" multiple placeholder="OS Type" filterable clearable style="width: 200px" class="filter-item">
      <el-option v-for="item in ostype_list" :key="item" :label="item" :value="item" />
    </el-select>&nbsp;&nbsp;
    <el-button class="filter-item" type="primary" icon="el-icon-magic-stick" @click="fetchEcsConfig">
      Generate Config
    </el-button>
    <el-button v-clipboard:copy="configs" v-clipboard:success="onCopy" v-clipboard:error="onError" class="filter-item" type="warning" icon="el-icon-document-copy">
      Copy Config
    </el-button>
    <pre v-highlightjs="configs" style="line-height:120%"><code class="yaml yamlcode" /></pre>
  </div>
</template>

<script>
import { getServicesList, getConfig } from '@/api/node-exporter'
export default {
  data() {
    return {
      listLoading: false,
      services: [],
      ostype: [],
      services_list: [],
      ostype_list: ['linux', 'windows'],
      services_dict: {},
      configs: ''
    }
  },
  created() {
    this.fetchEcsList()
  },
  methods: {
    onCopy() {
      this.$message({
        message: 'Copied!',
        type: 'success'
      })
    },
    onError() {
      this.$message.error('Copy failed! Please check error log.')
    },
    fetchEcsList() {
      this.listLoading = true
      getServicesList().then(response => {
        this.services_list = response.services_list
        this.services_list.push('selfnode_exporter')
        this.listLoading = false
      })
    },
    fetchEcsConfig() {
      this.listLoading = true
      this.services_dict.services_list = this.services
      this.services_dict.ostype_list = this.ostype
      getConfig(this.services_dict).then(response => {
        this.configs = response.configs
        this.listLoading = false
      })
    }
  }
}
</script>
<style>
  .yamlcode {
    font-family:'Consolas';
  }
  pre {
    max-height: 640px;
    white-space: pre-wrap;
    overflow:auto;
  }
</style>
