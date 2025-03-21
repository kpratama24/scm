<template>
  <div class="app-container">
    <div class="filter-container" style="flex: 1;display: flex;align-items: center;height: 50px;">
      <el-select v-model="listQuery.module" placeholder="Monitor Type" clearable collapse-tags style="width: 150px"
        class="filter-item">
        <el-option v-for="item in module_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.company" placeholder="Company Department" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in company_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.project" filterable placeholder="Project" clearable style="width: 150px"
        class="filter-item">
        <el-option v-for="item in project_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.env" filterable placeholder="Environment" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in env_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-tooltip effect="light" content="Click to clear search criteria" placement="top">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" circle
          @click="handleReset" />
      </el-tooltip>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add New
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="success" icon="el-icon-download"
        @click="handleDownload">
        Export
      </el-button>
      <el-upload style="margin-right: 10px;" class="upload-demo" action="/api/blackbox/upload" :headers="myHeaders"
        :on-success="success" :on-error="error" accept=".xlsx, .csv" :before-upload="handleBeforeUpload"
        :show-file-list="false" :multiple="false">
        <el-tooltip effect="light" content="Click [Export] to get import template" placement="top">
          <el-button v-waves style="margin-left: 10px;margin-top: 0px;" :loading="downloadLoading" class="filter-item"
            type="warning" icon="el-icon-upload2">
            Import
          </el-button>
        </el-tooltip>
      </el-upload>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleDelAll">
        Batch Delete
      </el-button>
      <div style="float: right;margin-left: 10px;">
        <el-input v-model="iname" prefix-icon="el-icon-search" placeholder="Filter by Name or URL" clearable style="width:180px"
          class="filter-item" @input="inameFilter(iname)" />
      </div>
    </div>

    <el-table v-loading="listLoading"
      :data="all_list.filter(data => !iname || (data.name.toLowerCase().includes(iname.toLowerCase()) || data.instance.toLowerCase().includes(iname.toLowerCase())))"
      border fit highlight-current-row style="width: 100%;" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="35" />
      <el-table-column label="ID" align="center" width="40px">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="module" label="Monitor Type" sortable width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.module }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="company" label="Company Department" sortable width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.company }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="project" label="Project" sortable width="180px" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.project }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="env" label="Environment" sortable align="center" width="73px">
        <template slot-scope="{row}">
          <span>{{ row.env }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" sortable width="200px" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="instance" label="URL" sortable align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span style="font-size: 12px">{{ row.instance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="handleFilter" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="37%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="auto"
        style="width: 90%; margin-left: 20px;">
        <el-form-item prop="module">
          <span slot="label">
            <span class="span-box">
              <span>Monitor Type</span>
              <el-tooltip style="diaplay:inline" effect="dark"
                content="This field must match the module name in Blackbox configuration, such as: http_2xx, http_post_2xx, tcp_connect, etc." placement="top">
                <i class="el-icon-info" />
              </el-tooltip>
            </span>
          </span>
          <el-autocomplete v-model="temp.module" :fetch-suggestions="Sugg_module" placeholder="Choose first, fill to add new" clearable
            class="filter-item" />
        </el-form-item>
        <el-form-item label="Company Department" prop="company">
          <el-autocomplete v-model="temp.company" :fetch-suggestions="Sugg_company" placeholder="Choose first, fill to add new" clearable
            class="filter-item" />
        </el-form-item>
        <el-form-item label="Project" prop="project">
          <el-autocomplete v-model="temp.project" :fetch-suggestions="Sugg_project" placeholder="Choose first, fill to add new" clearable
            class="filter-item" />
        </el-form-item>
        <el-form-item label="Environment" prop="env">
          <el-autocomplete v-model="temp.env" :fetch-suggestions="Sugg_env" placeholder="Choose first, fill to add new" clearable
            class="filter-item" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" placeholder="Please input" clearable class="filter-item" /><br>
          <font size="3px" color="#ff0000">The combination of the above 5 fields must be unique, duplicates will overwrite existing monitoring items!</font>
        </el-form-item>
        <el-form-item prop="instance">
          <span slot="label">
            <span class="span-box">
              <span>URL</span>
              <el-tooltip style="diaplay:inline" effect="dark"
                content="TCP check format: IP:port, HTTP check format: complete URL must start with http(s)://, ICMP check only fill IP or domain name." placement="top">
                <i class="el-icon-info" />
              </el-tooltip>
            </span>
          </span>
          <el-input v-model="temp.instance" placeholder="Add only one URL at a time, use import for batch adding" clearable class="filter-item" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus === 'create'" type="primary" @click="createAndNew">
          Confirm and Add New
        </el-button>
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

import { getAllList, getAllInfo, addService, updateService, delService } from '@/api/blackbox'
export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    const validateInput = (rule, value, callback) => {
      if (!this.checkSpecialKey(value)) {
        callback(new Error('Cannot contain spaces or [ ]`~!#$^&*=|"{}\':;?\\'))
      } else {
        callback()
      }
    }
    return {
      myHeaders: { Authorization: this.$store.getters.token },
      all_list: [],
      pall_list: [],
      iname: '',
      new_list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 30,
        module: '',
        company: '',
        project: '',
        env: ''
      },
      value_module: [],
      value_company: [],
      value_project: [],
      module_list: [],
      company_list: [],
      project_list: [],
      env_list: [],
      value_env: [],
      multipleSelection: [],
      del_dict: {},
      temp: {
        module: '',
        company: '',
        project: '',
        env: '',
        name: '',
        instance: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Update',
        create: 'Create URL Monitor'
      },
      rules: {
        module: [{ required: true, message: 'This field is required', trigger: 'change' },
        { validator: validateInput, trigger: ['blur', 'change'] }],
        company: [{ required: true, message: 'This field is required', trigger: 'change' },
        { validator: validateInput, trigger: ['blur', 'change'] }],
        project: [{ required: true, message: 'This field is required', trigger: 'change' },
        { validator: validateInput, trigger: ['blur', 'change'] }],
        env: [{ required: true, message: 'This field is required', trigger: 'change' },
        { validator: validateInput, trigger: ['blur', 'change'] }],
        name: [{ required: true, message: 'This field is required', trigger: 'change' },
        { validator: validateInput, trigger: ['blur', 'change'] }],
        instance: [{ required: true, message: 'This field is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },

  computed: {
    cmodule() {
      return this.listQuery.module
    },
    ccompany() {
      return this.listQuery.company
    },
    cproject() {
      return this.listQuery.project
    },
    cenv() {
      return this.listQuery.env
    }
  },

  watch: {
    cmodule(new_module) {
      this.fetchList(new_module, this.listQuery.company, this.listQuery.project, this.listQuery.env)
    },
    ccompany(new_company) {
      this.fetchList(this.listQuery.module, new_company, this.listQuery.project, this.listQuery.env)
    },
    cproject(new_project) {
      this.fetchList(this.listQuery.module, this.listQuery.company, new_project, this.listQuery.env)
    },
    cenv(new_env) {
      this.fetchList(this.listQuery.module, this.listQuery.company, this.listQuery.project, new_env)
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    handleBeforeUpload(file) {
      const uploadLimit = 5
      const uploadTypes = ['xlsx','csv']
      const filetype = file.name.replace(/.+\./, '')
      const isRightSize = (file.size || 0) / 1024 / 1024 < uploadLimit
      if (!isRightSize) {
        this.$message.error(`File size exceeds ${uploadLimit}MB!`)
        return false
      }
      if (uploadTypes.indexOf(filetype.toLowerCase()) === -1) {
        this.$message.warning({
          message: 'Only supports uploading xlsx and csv format files!'
        })
        return false
      }
      return true
    },
    success(response) {
      if (response.code === 20000) {
        this.fetchData()
        this.$message({
          message: response.data,
          type: 'success'
        })
      } else {
        this.$message({
          message: response.data,
          type: 'error'
        })
      }
    },
    error(response) {
      if (response.code === 50000) {
        this.$message({
          message: response.data,
          type: 'error'
        })
      }
    },
    inameFilter(iname) {
      if (iname === '') {
        this.handleFilter()
      } else {
        this.total = 0
        this.all_list = this.pall_list
      }
    },
    handleFilter() {
      this.total = this.pall_list.length
      this.all_list = this.pall_list.slice(0 + this.listQuery.limit * (this.listQuery.page - 1), this.listQuery.limit + this.listQuery.limit * (this.listQuery.page - 1))
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    checkSpecialKey(str) {
      const specialKey = '[]`~!#$^&*=|{}\'":;? \\'
      for (let i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) !== -1) {
          return false
        }
      }
      return true
    },
    fetchData() {
      this.listLoading = true
      getAllInfo().then(response => {
        this.all_list = response.all_list
        this.module_list = response.module_list
        this.company_list = response.company_list
        this.project_list = response.project_list
        this.env_list = response.env_list
        this.listLoading = false
        this.xmodule = this.load_module()
        this.xcompany = this.load_company()
        this.xproject = this.load_project()
        this.xenv = this.load_env()
        this.pall_list = response.all_list
        this.handleFilter()
      })
    },
    fetchList(module, company, project, env) {
      this.listLoading = true
      getAllList(module, company, project, env).then(response => {
        this.all_list = response.all_list
        this.listLoading = false
        this.module_list = response.module_list
        this.company_list = response.company_list
        this.project_list = response.project_list
        this.env_list = response.env_list
        this.listQuery.page = 1
        this.pall_list = response.all_list
        this.handleFilter()
      })
    },
    resetTemp() {
      this.temp = {}
    },

    handleCreate() {
      this.resetTemp()
      var newone = {
        module: this.listQuery.module,
        company: this.listQuery.company,
        project: this.listQuery.project,
        env: this.listQuery.env
      }
      this.temp = Object.assign({}, this.temp, newone)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addService(this.temp).then(response => {
            this.all_list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$message({
              message: response.data,
              type: 'success'
            })
          })
        }
      })
    },
    createAndNew() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addService(this.temp).then(response => {
            this.all_list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$message({
              message: response.data,
              type: 'success'
            })
            var newtemp = {
              module: this.temp.module,
              company: this.temp.company,
              project: this.temp.project,
              env: this.temp.env
            }
            this.resetTemp()
            this.temp = Object.assign({}, this.temp, newtemp)
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
              this.$refs['dataForm'].clearValidate()
            })
          })
        }
      })
    },
    handleReset() {
      this.fetchData()
      this.listQuery.module = ''
      this.listQuery.company = ''
      this.listQuery.project = ''
      this.listQuery.env = ''
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.del_dict = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const up_dict = Object.assign({}, this.temp)
          updateService(this.del_dict, up_dict).then(response => {
            this.dialogFormVisible = false
            this.$message({
              message: response.data,
              type: 'success'
            })
            this.all_list.splice(this.all_list.indexOf(this.del_dict), 1, up_dict)
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`This operation will delete [${row.env}: ${row.project}: ${row.name}], continue?`, 'Tip', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        delService(row).then(response => {
          this.$message({
            message: response.data,
            type: 'success'
          })
          this.$delete(this.all_list, this.all_list.indexOf(row))
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete cancelled'
        })
      })
    },
    handleDelAll() {
      this.$confirm('This operation will batch delete selected rows, continue?', 'Tip', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        for (let i = 0; i < this.multipleSelection.length; i++) {
          delService(this.multipleSelection[i]).then(response => {
            this.$message({
              message: response.data,
              type: 'success'
            })
          })
          this.$delete(this.all_list, this.all_list.indexOf(this.multipleSelection[i]))
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete cancelled'
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['Monitor Module', 'Company Department', 'Project', 'Environment', 'Name', 'URL(TCP format is IP:port, URL must start with http(s)://)']
        const filterVal = ['module', 'company', 'project', 'env', 'name', 'instance']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'Blackbox-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.all_list.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    Sugg_module(queryString, cb) {
      var xmodule = this.xmodule
      var results = queryString ? xmodule.filter(this.createFilter(queryString)) : xmodule
      cb(results)
    },
    Sugg_company(queryString, cb) {
      var xcompany = this.xcompany
      var results = queryString ? xcompany.filter(this.createFilter(queryString)) : xcompany
      cb(results)
    },
    Sugg_project(queryString, cb) {
      var xproject = this.xproject
      var results = queryString ? xproject.filter(this.createFilter(queryString)) : xproject
      cb(results)
    },
    Sugg_env(queryString, cb) {
      var xenv = this.xenv
      var results = queryString ? xenv.filter(this.createFilter(queryString)) : xenv
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    load_module() {
      for (const x in this.module_list) {
        this.value_module.push({ 'value': this.module_list[x] })
      }
      return this.value_module
    },
    load_company() {
      for (const x in this.company_list) {
        this.value_company.push({ 'value': this.company_list[x] })
      }
      return this.value_company
    },
    load_project() {
      for (const x in this.project_list) {
        this.value_project.push({ 'value': this.project_list[x] })
      }
      return this.value_project
    },
    load_env() {
      for (const x in this.env_list) {
        this.value_env.push({ 'value': this.env_list[x] })
      }
      return this.value_env
    }
  }
}
</script>