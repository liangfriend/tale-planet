<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@renderer/store/dataStore'
import type { SaveModel, StoryNode } from 'deciphony-enginetypes'
import { parseSaveData, stringifySaveData } from '@renderer/utils/saveData'
import { ElMessage } from 'element-plus'

const dataStore = useDataStore()
const { nodeMap } = storeToRefs(dataStore)

const router = useRouter()
const route = useRoute()

const type = computed(() => route.query.type as string)
const gameId = computed((): number => +route.query.gameId!)
const sceneId = computed((): number => {
  if (route.query.sceneId) return +route.query.sceneId
  return -1
})

const storyNode = computed(() => nodeMap.value.get(1) as StoryNode)

async function initData() {
  await dataStore.loadFromApi(type.value as 'test' | 'game', gameId.value)
}

onMounted(initData)

const menuList = computed(() => {
  if (type.value === 'test') {
    return [{ key: 'test', label: '测试游戏' }]
  }
  return [
    { key: 'start', label: '开始新游戏' },
    { key: 'loadSave', label: '加载存档' },
    { key: 'setting', label: '设置' },
    { key: 'exit', label: '退出游戏' }
  ]
})

const newSaveDialog = ref(false)
const newSaveName = ref('')
const loadDialog = ref(false)
const saveList = ref<SaveModel[]>([])

const createNewSave = async () => {
  if (!newSaveName.value) {
    ElMessage.warning('请输入存档名')
    return
  }
  const save = (
    await window.api.save.create({
      game_id: gameId.value,
      name: newSaveName.value,
      data: stringifySaveData({ sceneId: -1, extraData: {} })
    })
  ).data
  newSaveDialog.value = false
  router.replace({
    path: '/game/game',
    query: { saveId: save.id, gameId: gameId.value, sceneId: -1, type: type.value }
  })
}

async function getSaveList(gameId: number) {
  saveList.value = (await window.api.save.query({ game_id: gameId })).data
}

const loadSave = async (save: SaveModel) => {
  const data = parseSaveData(save.data)
  router.replace({
    path: '/game/game',
    query: { type: type.value, saveId: save.id, gameId: gameId.value, sceneId: data.sceneId }
  })
}

async function onMenuClick(key: string) {
  switch (key) {
    case 'start':
      newSaveDialog.value = true
      break
    case 'loadSave':
      await getSaveList(gameId.value)
      loadDialog.value = true
      break
    case 'test':
      router.replace({
        path: '/game/game',
        query: { gameId: gameId.value, sceneId: sceneId.value, type: type.value }
      })
      break
    case 'exit':
      router.replace({ path: '/home' })
      break
  }
}
</script>

<template>
  <div class="stack w-screen h-screen bg-black text-white" v-if="storyNode">
    <div class="stack-item">
      <div class="game-bg w-full h-full">
        <img class="bg-url" v-if="storyNode.bgUrl" :src="storyNode.bgUrl"></img>
      </div>
      <div
        class="absolute top-[10%] left-1/2 -translate-x-1/2 text-6xl font-bold tracking-widest drop-shadow-lg"
        :style="{ color: storyNode.fontColor || 'white' }"
      >
        {{ storyNode.nodeName }}
      </div>
    </div>
    <div class="stack-item">
      <div>
        <div
          class="absolute top-[35%] left-[12%] flex flex-col gap-6"
          :style="{ color: storyNode.fontColor || 'white' }"
        >
          <div
            v-for="item in menuList"
            :key="item.key"
            class="text-3xl cursor-pointer opacity-80 pl-4 relative transition-all duration-200"
            @click="onMenuClick(item.key)"
          >
            <span class="menu-text">{{ item.label }}</span>
          </div>
        </div>

        <el-dialog v-model="newSaveDialog" title="新建存档" width="400px">
          <el-input v-model="newSaveName" placeholder="请输入存档名" />
          <template #footer>
            <el-button @click="newSaveDialog = false">取消</el-button>
            <el-button type="primary" @click="createNewSave">进入游戏</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="loadDialog" title="选择存档" width="600px">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="save in saveList"
              :key="save.id"
              class="p-4 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
              @click="loadSave(save)"
            >
              <div class="text-xl font-bold mb-2">{{ save.name }}</div>
            </div>
          </div>
          <template #footer>
            <el-button @click="loadDialog = false">关闭</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-text {
  transition: 0.2s;
  position: relative;
}

.menu-text:hover {
  opacity: 1;
  transform: translateX(12px);
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

.menu-text::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  width: 4px;
  height: 0%;
  background: #aaa;
  transition: 0.3s;
  transform: translateY(-50%);
}

.menu-text:hover::before {
  height: 100%;
  background: #fff;
}

.bg-url {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
