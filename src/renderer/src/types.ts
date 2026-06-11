import { NodeEnum } from 'deciphony-engineenum'
import {
  ActionNode,
  AudioNode,
  CaptionNode,
  ConditionNode,
  CurtainNode,
  CustomNode,
  DialogueNode,
  EditorNode,
  FilterNode,
  ImageNode,
  LayoutNode,
  OptionNode,
  Prefab,
  SceneNode,
  StoryNode,
  VideoNode
} from 'deciphony-enginetypes'

export type * from 'deciphony-engine'

type baseModel = {
  created_at: number
  updated_at: number
  deleted_at: number
}

export type GameModel = baseModel & {
  id: number
  name: string
  data: string
  front_cover: string
  description: string
}

export type WorkModel = baseModel & {
  id: number
  name: string
  data: string
}

export type ResourceModel = baseModel & {
  id: number
  name: string
  type: string
  url: string
}
type NodeTypeMap = {
  [NodeEnum.Story]: StoryNode
  [NodeEnum.Scene]: SceneNode
  [NodeEnum.Dialogue]: DialogueNode
  [NodeEnum.Caption]: CaptionNode
  [NodeEnum.Action]: ActionNode
  [NodeEnum.Option]: OptionNode
  [NodeEnum.Layout]: LayoutNode
  [NodeEnum.Curtain]: CurtainNode
  [NodeEnum.Image]: ImageNode
  [NodeEnum.Video]: VideoNode
  [NodeEnum.Audio]: AudioNode
  [NodeEnum.Custom]: CustomNode
  [NodeEnum.Filter]: FilterNode
  [NodeEnum.Condition]: ConditionNode
}
export type EditorNodeOf<T extends NodeEnum> = Omit<EditorNode, 'node'> & { node: NodeTypeMap[T] }
// 编辑器视图信息
export type EditorInfo = {
  left: number
  top: number
  width: number
  height: number
  scale: number
}
export type OperationHistory = {
  editorInfo: EditorInfo
  editorNodeList: EditorNode[]
  prefabList: Array<Prefab>
}
