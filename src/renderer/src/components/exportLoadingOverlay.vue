<script setup lang="ts">
defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '正在导出游戏数据，请稍候…' }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="export-loading-overlay">
      <div class="export-loading-box">
        <div class="export-loading-spinner"></div>
        <p class="export-loading-text">{{ message }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.export-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 2900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}

.export-loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.export-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: export-spin 0.8s linear infinite;
}

.export-loading-text {
  margin: 0;
  font-size: 15px;
  color: #303133;
}

@keyframes export-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
