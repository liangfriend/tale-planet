// =============================== 撤销/恢复功能 ========================================
import { EditorInfo, EditorNode, OperationHistory, Prefab } from '../types'
import { Ref } from 'vue'

const undoStack: OperationHistory[] = []
const redoStack: OperationHistory[] = []

/*
 * 目前的话，只支持 editorNodeList 和 prefabList 的数组项增删的撤销恢复
 * */
export function useOperationHistory({
  editorNodeList,
  prefabList,
  editorInfo
}: Partial<{
  editorNodeList: Ref<EditorNode[]>
  prefabList: Ref<Prefab[]>
  editorInfo: Ref<EditorInfo>
}>) {
  function pushHistory(prevState: Partial<OperationHistory>) {
    undoStack.push(JSON.parse(JSON.stringify(prevState)))
    redoStack.length = 0
  }

  function undo(data: Partial<OperationHistory>) {
    if (undoStack.length === 0) return

    redoStack.push(JSON.parse(JSON.stringify(data)))

    const prev = undoStack.pop()
    const newData: OperationHistory = JSON.parse(JSON.stringify(prev))
    if (newData.editorNodeList && editorNodeList) editorNodeList.value = newData.editorNodeList
    if (newData.editorInfo && editorInfo) editorInfo.value = newData.editorInfo
    if (newData.prefabList && prefabList) prefabList.value = newData.prefabList
  }

  function redo(data: Partial<OperationHistory>) {
    if (redoStack.length === 0) return

    undoStack.push(JSON.parse(JSON.stringify(data)))

    const next = redoStack.pop()
    const newData = JSON.parse(JSON.stringify(next))
    if (newData.editorNodeList && editorNodeList) editorNodeList.value = newData.editorNodeList
    if (newData.editorInfo && editorInfo) editorInfo.value = newData.editorInfo
    if (newData.prefabList && prefabList) prefabList.value = newData.prefabList
  }

  return { pushHistory, redo, undo }
}
