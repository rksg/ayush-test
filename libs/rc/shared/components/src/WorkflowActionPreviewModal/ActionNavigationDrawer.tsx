
import { Tree, Drawer } from 'antd'
import { DataNode }     from 'antd/lib/tree'
import { useIntl }      from 'react-intl'
import {
  Node
} from 'reactflow'

import { ActionType, ActionTypeTitle, disablePreviewActionType, WorkflowStep } from '@acx-ui/rc/utils'
import { getIntl }                                                             from '@acx-ui/utils'


export interface ActionNavigationDrawerProps {
  onSelect: (v: string)=>void
  onClose: ()=>void
  visible: boolean
  nodes: Node<WorkflowStep, ActionType>[]
  selectedStepId?: string
}

function transformToDataNode (nodes: Node<WorkflowStep, ActionType>[], selectedId?: string)
: DataNode[] {
  const dataNodes:DataNode[] = []
  const { $t } = getIntl()
  nodes.filter(node => node.type !== 'START' as ActionType
  && !disablePreviewActionType.has(node.type as ActionType))
    .forEach(node => {
      dataNodes.push(
        {
          title: $t(ActionTypeTitle[node.data.actionType!]),
          key: node.data.id,
          style: {
            color: node.data.id === selectedId ?
              'var(--acx-primary-black)' : 'var(--acx-accents-blue-50)'
          }
        }
      )
    })
  return dataNodes
}

export function ActionNavigationDrawer (props: ActionNavigationDrawerProps) {
  const { $t } = useIntl()
  const { onClose, nodes, visible, onSelect, selectedStepId } = props
  return <Drawer
    title={$t({ defaultMessage: 'Preview Navigator' })}
    onClose={onClose}
    closable
    visible={visible}
    placement='left'
    maskClosable={false}
    mask={false}
    width={'336px'}
    style={{ position: 'absolute', top: '-25px' }}
    contentWrapperStyle={{ height: '745px' }}
    getContainer={()=>document.getElementById('actiondemocontent') as HTMLElement}
  >
    <Tree
      treeData={transformToDataNode(nodes, selectedStepId)}
      defaultSelectedKeys={selectedStepId ? [selectedStepId] : []}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSelect={(_, info)=> {
        if (!info.node.children) {
          onSelect(info.node.key.toString())
        }
      }}>
    </Tree>
  </Drawer>
}
