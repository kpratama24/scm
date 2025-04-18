<template>
  <div class="app-container">
    <div class="filter-container" style="flex: 1;display: flex;align-items: center;height: 50px;">
      <el-select v-model="listQuery.vendor" placeholder="Datacenter/Company" clearable collapse-tags style="width: 150px" class="filter-item">
        <el-option v-for="item in vendor_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.account" placeholder="UID/Department" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in account_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.region" filterable placeholder="Region/Project" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in region_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.group" filterable placeholder="Group/Environment" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in group_list" :key="item" :label="item" :value="item" />
      </el-select>
      <el-tooltip effect="light" content="Click to clear search criteria" placement="top">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" circle @click="handleReset" />
      </el-tooltip>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="success" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-upload
        style="margin-right: 9px;"
        class="upload-demo"
        action="/api/selfrds/upload"
        :headers="myHeaders"
        :on-success="success"
        :on-error="error"
        accept=".xlsx, .csv"
        :before-upload="handleBeforeUpload"
        :show-file-list="false"
        :multiple="false"
      >
        <el-tooltip effect="light" content="Click [Export] to get import template" placement="top">
          <el-button v-waves style="margin-left: 9px;margin-top: 0px;" :loading="downloadLoading" class="filter-item" type="warning" icon="el-icon-upload2">
            Import
          </el-button>
        </el-tooltip>
      </el-upload>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleDelAll">
        Batch Delete
      </el-button>
      <div style="float: right;margin-left: 9px;">
        <el-input v-model="iname" prefix-icon="el-icon-search" placeholder="Enter name or instance to filter" clearable style="width:180px" class="filter-item" @input="inameFilter(iname)" />
      </div>
    </div>

    <el-table
      v-loading="listLoading"
      :data="all_list.filter(data => !iname || (data.name.toLowerCase().includes(iname.toLowerCase()) || data.instance.toLowerCase().includes(iname.toLowerCase())))"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="35" />
      <el-table-column label="ID" align="center" width="40px">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="vendor" label="Datacenter/Company" sortable align="center">
        <template slot-scope="{row}">
          <span>{{ row.vendor }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="UID/Department" sortable align="center">
        <template slot-scope="{row}">
          <span>{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="region" label="Region/Project" sortable align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.region }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="group" label="Group/Environment" sortable align="center">
        <template slot-scope="{row}">
          <span>{{ row.group }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" sortable align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="instance" label="Instance" sortable align="center" width="160" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.instance }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="os" label="Host System" sortable align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.os }}</span>
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleFilter" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="37%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="auto" style="width: 90%; margin-left: 20px;">
        <font size="3px" color="#ff0000">【Note: The combination of the first 5 fields must be unique, duplicates will overwrite existing monitoring items!】</font>
        <el-form-item label="Datacenter/Company" prop="vendor">
          <el-autocomplete v-model="temp.vendor" :fetch-suggestions="Sugg_vendor" placeholder="Priority selection" clearable class="filter-item" />
        </el-form-item>
        <el-form-item label="UID/Department" prop="account">
          <el-autocomplete v-model="temp.account" :fetch-suggestions="Sugg_account" placeholder="Priority selection" clearable class="filter-item" />
        </el-form-item>
        <el-form-item label="Region/Project" prop="region">
          <el-autocomplete v-model="temp.region" :fetch-suggestions="Sugg_region" placeholder="Priority selection" clearable class="filter-item" />
        </el-form-item>
        <el-form-item label="Group/Environment" prop="group">
          <el-autocomplete v-model="temp.group" :fetch-suggestions="Sugg_group" placeholder="Priority selection" clearable class="filter-item" />
        </el-form-item>
        <el-form ref="dataForm" :inline="true" :rules="rules" :model="temp" class="demo-form-inline" label-position="right" label-width="50px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="temp.name" placeholder="Please enter" clearable />
          </el-form-item>
          <el-form-item label="Host" prop="os">
            <el-select v-model="temp.os" placeholder="Please select" style="width: 130px;" @change="temp.port=osport[temp.os]">
              <el-option label="linux" value="linux" />
              <el-option label="windows" value="windows" />
            </el-select>
          </el-form-item>
          <el-form-item label="IP" prop="ip">
            <el-input v-model="temp.ip" placeholder="Please enter" clearable />
          </el-form-item>
          <el-form-item label="Port" prop="port">
            <el-input v-model="temp.port" placeholder="Please enter" clearable style="width: 130px;" />
          </el-form-item>
        </el-form>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus==='create'" type="primary" @click="createAndNew">
          Confirm and Add New
        </el-button>
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

import { getAllList, getAllInfo, addService, updateService, delService } from '@/api/selfrds'
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
        vendor: '',
        account: '',
        region: '',
        group: ''
      },
      value_vendor: [],
      value_account: [],
      value_region: [],
      value_group: [],
      vendor_list: [],
      account_list: [],
      group_list: [],
      region_list: [],
      multipleSelection: [],
      del_dict: {},
      osport: { linux: '3306', windows: '3306' },
      temp: {
        vendor: '',
        account: '',
        region: '',
        group: '',
        name: '',
        os: '',
        ip: '',
        port: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Update',
        create: 'Create'
      },
      rules: {
        vendor: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        account: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        region: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        group: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        name: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        ip: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        port: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }],
        os: [{ required: true, message: 'This field is required', trigger: 'change' },
          { validator: validateInput, trigger: ['blur', 'change'] }]
      },
      downloadLoading: false
    }
  },

  computed: {
    cvendor() {
      return this.listQuery.vendor
    },
    caccount() {
      return this.listQuery.account
    },
    cregion() {
      return this.listQuery.region
    },
    cgroup() {
      return this.listQuery.group
    }
  },

  watch: {
    cvendor(new_vendor) {
      this.fetchList(new_vendor, this.listQuery.account, this.listQuery.region, this.listQuery.group)
    },
    caccount(new_account) {
      this.fetchList(this.listQuery.vendor, new_account, this.listQuery.region, this.listQuery.group)
    },
    cregion(new_region) {
      this.fetchList(this.listQuery.vendor, this.listQuery.account, new_region, this.listQuery.group)
    },
    cgroup(new_group) {
      this.fetchList(this.listQuery.vendor, this.listQuery.account, this.listQuery.region, new_group)
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
          message: 'Only xlsx and csv format files are supported!'
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
        this.vendor_list = response.vendor_list
        this.account_list = response.account_list
        this.region_list = response.region_list
        this.group_list = response.group_list
        this.listLoading = false
        this.xvendor = this.load_vendor()
        this.xaccount = this.load_account()
        this.xregion = this.load_region()
        this.xgroup = this.load_group()
        this.pall_list = response.all_list
        this.handleFilter()
      })
    },
    fetchList(vendor, account, region, group) {
      this.listLoading = true
      getAllList(vendor, account, region, group).then(response => {
        this.all_list = response.all_list
        this.listLoading = false
        this.vendor_list = response.vendor_list
        this.account_list = response.account_list
        this.region_list = response.region_list
        this.group_list = response.group_list
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
        vendor: this.listQuery.vendor,
        account: this.listQuery.account,
        region: this.listQuery.region,
        group: this.listQuery.group,
        os: 'linux',
        port: '3306'
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
            this.temp.instance = this.temp.ip + ':' + this.temp.port
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
            this.temp.instance = this.temp.ip + ':' + this.temp.port
            this.all_list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$message({
              message: response.data,
              type: 'success'
            })
            var newtemp = {
              vendor: this.temp.vendor,
              account: this.temp.account,
              region: this.temp.region,
              group: this.temp.group,
              os: 'linux',
              port: '3306'
            }
            this.resetTemp()
            this.temp = Object.assign({}, this.temp, newone)
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
      this.listQuery.vendor = ''
      this.listQuery.account = ''
      this.listQuery.region = ''
      this.listQuery.group = ''
    },
    handleUpdate(row) {
      row.ip = row.instance.split(':')[0]
      row.port = row.instance.split(':')[1]
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
            up_dict.instance = up_dict.ip + ':' + up_dict.port
            this.all_list.splice(this.all_list.indexOf(this.del_dict), 1, up_dict)
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('This operation will delete【' + row.group + '：' + row.region + '：' + row.name + '】, continue?', 'Confirmation', {
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
      this.$confirm('This operation will batch delete selected rows, continue?', 'Confirmation', {
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
        const tHeader = ['Datacenter/Company', 'UID/Department', 'Region/Project', 'Group/Environment', 'Name', 'Instance(IP:Port)', 'Host System(linux/windows)']
        const filterVal = ['vendor', 'account', 'region', 'group', 'name', 'instance', 'os']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'selfrds-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.all_list.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    Sugg_vendor(queryString, cb) {
      var xvendor = this.xvendor
      var results = queryString ? xvendor.filter(this.createFilter(queryString)) : xvendor
      cb(results)
    },
    Sugg_account(queryString, cb) {
      var xaccount = this.xaccount
      var results = queryString ? xaccount.filter(this.createFilter(queryString)) : xaccount
      cb(results)
    },
    Sugg_region(queryString, cb) {
      var xregion = this.xregion
      var results = queryString ? xregion.filter(this.createFilter(queryString)) : xregion
      cb(results)
    },
    Sugg_group(queryString, cb) {
      var xgroup = this.xgroup
      var results = queryString ? xgroup.filter(this.createFilter(queryString)) : xgroup
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    load_vendor() {
      for (const x in this.vendor_list) {
        this.value_vendor.push({ 'value': this.vendor_list[x] })
      }
      return this.value_vendor
    },
    load_account() {
      for (const x in this.account_list) {
        this.value_account.push({ 'value': this.account_list[x] })
      }
      return this.value_account
    },
    load_region() {
      for (const x in this.region_list) {
        this.value_region.push({ 'value': this.region_list[x] })
      }
      return this.value_region
    },
    load_group() {
      for (const x in this.group_list) {
        this.value_group.push({ 'value': this.group_list[x] })
      }
      return this.value_group
    }
  }
}
</script>
