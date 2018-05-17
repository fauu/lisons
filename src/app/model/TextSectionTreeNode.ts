export interface TextSectionTreeNode {
  label: string
  contentFilePath: string
  contentFragmentId?: string
  children: TextSectionTreeNode[]
}
