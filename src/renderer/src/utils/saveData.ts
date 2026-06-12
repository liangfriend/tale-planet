/** 存档 data 字段：进度与运行时状态，游戏本体始终来自 editorNodeList */
export type SaveData = {
  sceneId: number
  extraData: Record<string, unknown>
}

export function parseSaveData(raw: string): SaveData {
  const data = JSON.parse(raw)
  // 兼容旧存档 { sceneId, gameData: '{}' }
  if (data.extraData == null && data.gameData != null) {
    return {
      sceneId: data.sceneId ?? -1,
      extraData: {}
    }
  }
  return {
    sceneId: data.sceneId ?? -1,
    extraData: data.extraData ?? {}
  }
}

export function stringifySaveData(data: SaveData): string {
  return JSON.stringify(data)
}
