import { dialog, ipcMain } from 'electron'
import { ExportService } from '../services/exportService'

export class ExportController {
  private exportService: ExportService

  constructor({ exportService }: { exportService: ExportService }) {
    this.exportService = exportService
  }

  register() {
    ipcMain.handle(
      'export:gameBundle',
      async (
        _,
        payload: { gameData: unknown; extraData: Record<string, unknown> }
      ) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: '导出游戏数据',
          defaultPath: 'game-export.zip',
          filters: [{ name: '游戏压缩包', extensions: ['zip'] }]
        })

        if (canceled || !filePath) {
          return { canceled: true }
        }

        const result = await this.exportService.exportGameBundle(filePath, payload)
        return { canceled: false, ...result }
      }
    )
  }
}
