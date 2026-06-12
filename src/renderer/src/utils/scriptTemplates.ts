/** 条件节点 func 默认模板（运行时可用：nodeMap, extraData） */
export const conditionFuncTemplate = `const storyNode = nodeMap.get(1)
const data = extraData
return true`

/** DataChange 行为默认模板（运行时可用：extraData） */
export const dataChangeFuncTemplate = `const data = extraData
// data.favor = (data.favor || 0) + 1`
