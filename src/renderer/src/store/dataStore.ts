import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { NodeEnum } from 'deciphony-engine'
import { EditorNode, EngineNode, Prefab } from '@renderer/types'
import { useOperationHistory } from '@renderer/composables/useOperationHistory'

export const useDataStore = defineStore('data', () => {
  const editorNodeList = ref<EditorNode[]>([])
  const prefabList = ref<Prefab[]>([])
  /** 测试/游玩时的 extraData 初始值（来自 work / game 表） */
  const defaultExtraData = ref<Record<string, unknown>>({})

  const editorNodeMap = computed(() => {
    const map = new Map<number, EditorNode>()
    editorNodeList.value.forEach((item) => {
      map.set(item.node.id, item)
    })
    return map
  })

  /** 从 editorNodeList 推导出引擎节点列表，供游戏运行时消费 */
  const engineNodes = computed(() => editorNodeList.value.map((item) => item.node))

  const nodeMap = computed(() => {
    const map = new Map<number, EngineNode>()
    engineNodes.value.forEach((node) => {
      map.set(node.id, node)
    })
    return map
  })

  const groupedNodes = computed((): Record<NodeEnum, EditorNode[]> => {
    const groups: Record<NodeEnum, EditorNode[]> = {
      [NodeEnum.Story]: [],
      [NodeEnum.Scene]: [],
      [NodeEnum.Dialogue]: [],
      [NodeEnum.Caption]: [],
      [NodeEnum.Action]: [],
      [NodeEnum.Option]: [],
      [NodeEnum.Layout]: [],
      [NodeEnum.Curtain]: [],
      [NodeEnum.Image]: [],
      [NodeEnum.Video]: [],
      [NodeEnum.Audio]: [],
      [NodeEnum.Custom]: [],
      [NodeEnum.Filter]: [],
      [NodeEnum.Condition]: []
    }
    editorNodeList.value.forEach((item) => {
      const type = item.node.nodeType as NodeEnum
      if (groups[type]) {
        groups[type].push(item)
      }
    })
    return groups
  })

  const { pushHistory } = useOperationHistory({ editorNodeList, prefabList })

  function loadData(
    list: EditorNode[],
    prefabs: Prefab[],
    extraData: Record<string, unknown> = {}
  ) {
    editorNodeList.value = list ?? []
    prefabList.value = prefabs ?? []
    defaultExtraData.value = extraData ?? {}
  }

  /** 从 work / game 表加载 */
  async function loadFromApi(type: 'test' | 'game', id: number) {
    if (type === 'test') {
      const work = (await window.api.work.query({ id })).data?.[0]
      if (work) {
        const data = JSON.parse(work.data)
        loadData(data.editorNodeList ?? [], data.prefabList ?? [], data.extraData ?? {})
      }
    } else {
      const game = (await window.api.game.query({ id })).data?.[0]
      if (game) {
        const data = JSON.parse(game.data)
        loadData(data.editorNodeList ?? [], data.prefabList ?? [], data.extraData ?? {})
      }
    }
  }

  function addNode(node: EditorNode) {
    pushHistory({ editorNodeList: editorNodeList.value })
    editorNodeList.value.push(node)
  }

  function removeNode(id: string | number) {
    const index = editorNodeList.value.findIndex((item) => item.node.id === id)
    if (index !== -1) {
      pushHistory({ editorNodeList: editorNodeList.value })
      editorNodeList.value.splice(index, 1)
    }
  }

  function removeNodes(ids: number[]) {
    if (ids.length === 0) return
    const idsToDelete = new Set(ids)
    pushHistory({ editorNodeList: editorNodeList.value })
    editorNodeList.value = editorNodeList.value.filter((item) => !idsToDelete.has(item.node.id))
  }

  function addNodes(nodes: EditorNode[]) {
    pushHistory({ editorNodeList: editorNodeList.value })
    editorNodeList.value.push(...nodes)
  }

  function clearNodeManager() {
    pushHistory({ editorNodeList: editorNodeList.value })
    editorNodeList.value = []
  }

  function addPrefab(prefab: Prefab) {
    pushHistory({ prefabList: prefabList.value })
    prefabList.value.push(prefab)
  }

  function deletePrefab(id: number) {
    const index = prefabList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      pushHistory({ prefabList: prefabList.value })
      prefabList.value.splice(index, 1)
    }
  }

  function clearPrefab() {
    pushHistory({ prefabList: prefabList.value })
    prefabList.value = []
  }

  return {
    editorNodeList,
    prefabList,
    defaultExtraData,
    engineNodes,
    nodeMap,
    editorNodeMap,
    groupedNodes,
    loadData,
    loadFromApi,
    addNode,
    removeNode,
    removeNodes,
    addNodes,
    clearNodeManager,
    addPrefab,
    deletePrefab,
    clearPrefab
  }
})
