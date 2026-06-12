/** 编辑器内 monaco 编辑 extraData 的默认文本 */
export const defaultExtraDataText = '{}'

export function formatExtraDataText(data: Record<string, unknown> = {}): string {
  return JSON.stringify(data, null, 2)
}

export function parseExtraDataText(text: string): Record<string, unknown> {
  const parsed = JSON.parse(text?.trim() || '{}')
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('extraData 必须是 JSON 对象')
  }
  return parsed as Record<string, unknown>
}
