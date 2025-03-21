<template>
    <div class="app-container">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span><i class="el-icon-document"></i> Prometheus Metrics Report Generator</span>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="loading" class="loading-container">
          <el-progress type="circle" :percentage="progress" :status="progress === 100 ? 'success' : ''"></el-progress>
          <p>{{ loadingMessage }}</p>
        </div>
        
        <div v-else>
          <!-- Report Configuration Form -->
          <el-form :model="reportForm" label-position="top" label-width="120px" class="report-form">
            <el-form-item label="Prometheus URL">
              <el-input v-model="reportForm.prometheusUrl" placeholder="http://localhost:9090"></el-input>
            </el-form-item>
            
            <el-form-item label="Output Filename (optional)">
              <el-input v-model="reportForm.outputFilename" placeholder="report.pdf"></el-input>
            </el-form-item>
            
            <el-form-item label="Vendor">
              <div class="vendor-selection">
                <el-select v-model="reportForm.vendor" placeholder="Select a vendor (optional)" clearable style="width: 100%">
                  <el-option
                    v-for="vendor in vendors"
                    :key="vendor"
                    :label="vendor"
                    :value="vendor">
                  </el-option>
                </el-select>
                
                <el-tooltip content="Refresh vendor list" placement="top">
                  <el-button type="primary" icon="el-icon-refresh" circle @click="fetchVendors"></el-button>
                </el-tooltip>
              </div>
            </el-form-item>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
              <el-button type="primary" @click="generateReport" :disabled="loading">
                <i class="el-icon-document"></i> Generate Report
              </el-button>
              
              <el-button type="info" @click="fetchVendors" :disabled="loading">
                <i class="el-icon-refresh"></i> Refresh Vendor List
              </el-button>
            </div>
          </el-form>
          
          <!-- Results Display -->
          <div v-if="resultMessage" :class="['result-message', { 'error': isError }]">
            <i :class="isError ? 'el-icon-error' : 'el-icon-success'"></i>
            <pre>{{ resultMessage }}</pre>
          </div>
          
          <!-- Vendor List Table (shown when vendors are fetched) -->
          <div v-if="vendors.length > 0" class="vendor-list">
            <h3>Available Vendors</h3>
            <el-table :data="vendors" style="width: 100%" border>
              <el-table-column type="index" width="50"></el-table-column>
              <el-table-column prop="vendor" label="Vendor Name">
                <template slot-scope="scope">
                  {{ scope.row }}
                </template>
              </el-table-column>
              <el-table-column width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="selectVendor(scope.row)">
                    Select
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'ReportGenerator',
    data() {
      return {
        reportForm: {
          prometheusUrl: 'http://localhost:9090',
          vendor: '',
          outputFilename: ''
        },
        vendors: [],
        loading: false,
        resultMessage: '',
        isError: false,
        progress: 0,
        loadingMessage: ''
      }
    },
    created() {
      // Fetch vendors when component is created
      this.fetchVendors()
    },
    methods: {
      // Fetch the list of available vendors
      fetchVendors() {
        this.loading = true
        this.progress = 25
        this.loadingMessage = 'Fetching available vendors...'
        
        axios.post('/api/execute-script', {
          command: 'cd /root/pdf && source bin/activate && python reportUpdate.py --list-vendors'
        })
          .then(response => {
            this.progress = 100
            if (response.data.success) {
              // Parse the output to extract vendor list
              const output = response.data.output
              const vendorLines = output.split('\n').filter(line => line.trim() !== '')
              
              // Remove any header lines and extract just the vendor names
              this.vendors = vendorLines
                .filter(line => !line.toLowerCase().includes('available vendors'))
                .map(line => line.trim())
                
              this.resultMessage = 'Successfully fetched vendor list.'
              this.isError = false
            } else {
              this.resultMessage = `Error: ${response.data.error || 'Failed to fetch vendors'}`
              this.isError = true
            }
          })
          .catch(error => {
            this.resultMessage = `Error: ${error.message || 'Network error when fetching vendors'}`
            this.isError = true
          })
          .finally(() => {
            this.loading = false
          })
      },
      
      // Generate the report with current settings
      generateReport() {
        this.loading = true
        this.progress = 10
        this.loadingMessage = 'Preparing to generate report...'
        
        // Build the command with appropriate parameters
        let command = 'cd /root/pdf && source bin/activate && python reportUpdate.py'
        
        if (this.reportForm.vendor) {
          command += ` --vendor "${this.reportForm.vendor}"`
        }
        
        if (this.reportForm.prometheusUrl) {
          command += ` --prometheus-url "${this.reportForm.prometheusUrl}"`
        }
        
        if (this.reportForm.outputFilename) {
          command += ` --output "${this.reportForm.outputFilename}"`
        }
        
        this.progress = 25
        this.loadingMessage = 'Executing report generation script...'
        
        axios.post('/api/execute-script', { command })
          .then(response => {
            this.progress = 100
            if (response.data.success) {
              this.resultMessage = response.data.output || 'Report generated successfully!'
              
              // Add a link to download the file if a filename was specified
              if (this.reportForm.outputFilename) {
                const fileName = this.reportForm.outputFilename
                this.resultMessage += `\n\nReport saved as: ${fileName}`
              }
              
              this.isError = false
            } else {
              this.resultMessage = `Error: ${response.data.error || 'Failed to generate report'}`
              this.isError = true
            }
          })
          .catch(error => {
            this.resultMessage = `Error: ${error.message || 'Network error when generating report'}`
            this.isError = true
          })
          .finally(() => {
            this.loading = false
          })
      },
      
      // Select a vendor from the table
      selectVendor(vendor) {
        this.reportForm.vendor = vendor
      }
    }
  }
  </script>
  
  <style scoped>
  .app-container {
    padding: 20px;
  }
  
  .box-card {
    margin-bottom: 20px;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
  
  .report-form {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .vendor-selection {
    display: flex;
    align-items: center;
  }
  
  .vendor-selection .el-select {
    flex: 1;
    margin-right: 10px;
  }
  
  .action-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .result-message {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    background-color: #f0f9eb;
    border: 1px solid #e1f3d8;
    white-space: pre-wrap;
  }
  
  .result-message.error {
    background-color: #fef0f0;
    border-color: #fde2e2;
  }
  
  .vendor-list {
    margin-top: 30px;
  }
  
  pre {
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  </style>