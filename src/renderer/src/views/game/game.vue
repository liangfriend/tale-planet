<script setup lang="ts">
import gameView from 'deciphony-engine'
import { updateLoadedGameData } from 'deciphony-engine'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@renderer/store/dataStore'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

const route = useRoute()
const dataStore = useDataStore()
const { engineNodes } = storeToRefs(dataStore)

const ready = ref(false)
const extraData = ref<{ gameData?: string }>({})

const sceneId = computed(() => {
  const id = route.query.sceneId
  return id !== undefined ? +id : -1
})

onMounted(async () => {
  const type = (route.query.type as 'test' | 'game') ?? 'test'
  const gameId = +route.query.gameId!
  await dataStore.loadFromApi(type, gameId)

  const saveId = route.query.saveId
  if (saveId) {
    const save = (await window.api.save.query({ id: saveId })).data?.[0]
    if (save) {
      const data = JSON.parse(save.data)
      extraData.value = { gameData: data.gameData ?? '{}' }
    }
  } else {
    updateLoadedGameData('{}')
  }

  ready.value = true
})
</script>

<template>
  <gameView
    v-if="ready && engineNodes.length"
    :game-data="engineNodes"
    :scene-id="sceneId"
    :extra-data="extraData"
  />
</template>

<style scoped></style>
