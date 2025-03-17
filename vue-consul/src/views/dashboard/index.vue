<template>
  <div class="dashboard-container">
    <el-alert type="success" center close-text="">
      <el-link type="success" href="#"
        target="_blank">🏆All services operating normally. Enjoy!</el-link>
    </el-alert><br>
    <el-badge :value="0" class="mark">
      <el-link :underline="false" type="primary" href="#"
        class="dashboard-text">Sisnet Console Manager</el-link>
    </el-badge>
    <el-timeline>
      <el-timeline-item timestamp="2025/03/02" placement="top">
        <el-card>
          <h4>v1.0.</h4>
          <p>Initial Build</p>
        </el-card>
      </el-timeline-item>
      <el-timeline-item timestamp="2025/03/12" placement="top">
        <el-card>
          <h4>v1.0.1</h4>
          <p>ECS Translation Completed</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

li {
  margin: 20px 0;
}
</style>
