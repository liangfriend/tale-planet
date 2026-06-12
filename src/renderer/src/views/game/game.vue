<script setup lang="ts">
import gameView, { type GameAutoSavePayload } from 'deciphony-engine'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@renderer/store/dataStore'
import { parseSaveData, stringifySaveData } from '@renderer/utils/saveData'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const { engineNodes, defaultExtraData } = storeToRefs(dataStore)

const ready = ref(false)
const loadError = ref('')
const saveId = ref<number | null>(null)
const sceneId = ref(-1)
const extraData = ref<Record<string, unknown>>({})

async function onAutoSave(payload: GameAutoSavePayload) {
  if (!saveId.value) return
  sceneId.value = payload.sceneId
  extraData.value = payload.extraData
  await window.api.save.update(saveId.value, {
    data: stringifySaveData({
      sceneId: payload.sceneId,
      extraData: payload.extraData
    })
  })
}

async function onExit() {
  const type = route.query.type as string
  const gameId = route.query.gameId
  if (type === 'test' && (await window.api.window.get('game'))) {
    window.api.window.close('game')
    return
  }
  if (type === 'test') {
    router.replace({ path: '/home' })
    return
  }
  router.replace({ path: '/game/entry', query: { gameId, type } })
}

onMounted(async () => {
  const type = (route.query.type as 'test' | 'game') ?? 'test'
  const gameId = +route.query.gameId!
  await dataStore.loadFromApi(type, gameId)

  if (!engineNodes.value.length) {
    loadError.value = '游戏数据为空，请先在编辑器中配置故事节点'
    ready.value = true
    return
  }

  const sid = route.query.saveId
  if (sid) {
    saveId.value = +sid
    const save = (await window.api.save.query({ id: saveId.value })).data?.[0]
    if (save) {
      const data = parseSaveData(save.data)
      sceneId.value = data.sceneId
      extraData.value = data.extraData
    }
  } else if (route.query.sceneId != null) {
    sceneId.value = +route.query.sceneId
    extraData.value = { ...defaultExtraData.value }
  } else {
    extraData.value = { ...defaultExtraData.value }
  }

  ready.value = true
})
</script>

<template>
  <div v-if="ready && loadError" class="flex items-center justify-center w-screen h-screen bg-black text-white">
    {{ loadError }}
  </div>
  <gameView
    v-else-if="ready && engineNodes.length"
    :game-data="engineNodes"
    :scene-id="sceneId"
    v-model:extra-data="extraData"
    @auto-save="onAutoSave"
    @exit="onExit"
  />
</template>

<style scoped></style>
