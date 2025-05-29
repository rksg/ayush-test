import { ReactNode } from 'react'

import { useIntl }                                          from 'react-intl'
import { NodeProps, useNodeId, useNodes } from 'reactflow'
import { WarningCircleSolid } from '@acx-ui/icons'
import { useWorkflowContext }         from '../WorkflowContextProvider'

import * as UI               from './styledComponents'

export default function DisconnectedBranchNode (props: NodeProps)
{

  const { $t } = useIntl()
  const nodeId = useNodeId()
  const nodes = useNodes()
  const {
    nodeState, actionDrawerState,
    stepDrawerState, workflowId
  } = useWorkflowContext()





  return (
    <>
      {/* TODO: add plus above subflow */}
      <UI.DisconnectedBranchNode {...props} style={{width: '100%', height: '100%'}}>
        {/* TODO: add hover with error info */}
        <UI.InvalidIcon>
          <WarningCircleSolid />
        </UI.InvalidIcon>

      </UI.DisconnectedBranchNode>
    </>
  )
}
