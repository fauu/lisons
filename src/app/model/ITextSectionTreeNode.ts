export interface ITextSectionTreeNode {
  label: string
  contentFilePath: string
  contentFragmentId?: string
  children: ITextSectionTreeNode[]
}
