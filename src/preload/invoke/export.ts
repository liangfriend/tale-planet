import { ipcRenderer } from 'electron'

export const exportInvoke = {
  gameBundle: (payload: { gameData: unknown; extraData: Record<string, unknown> }) =>
    ipcRenderer.invoke('export:gameBundle', payload)
}
