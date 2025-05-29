import { ReactNode } from 'react'

import { useIntl }                                          from 'react-intl'
import { NodeProps, useNodeId, useNodes } from 'reactflow'
import { Plus, WarningCircleSolid } from '@acx-ui/icons'
import { useWorkflowContext }         from '../WorkflowContextProvider'

import * as UI               from './styledComponents'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Row, Tooltip } from 'antd'

export default function DisconnectedBranchNode (props: NodeProps)
{

  const { $t } = useIntl()
  const workflowValidationEnhancementFFToggle 
    = useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)

  const nodeId = useNodeId()
  const nodes = useNodes()
  const {
    nodeState, actionDrawerState,
    stepDrawerState, workflowId
  } = useWorkflowContext()





  return (
    <>
      <UI.DisconnectedBranchNode {...props} style={{width: '100%', height: '100%'}}>

        <UI.DisconnectedBranchPlusButton>
          <Plus />
        </UI.DisconnectedBranchPlusButton>

        {workflowValidationEnhancementFFToggle &&
          <Tooltip
            showArrow={false}
            // @ts-ignore
            title={<Row>{ $t({defaultMessage: 'This branch is diconnected from the rest of the '
              + 'workflow. Drag over another branch to connec them.'}) }</Row>}>
            <UI.InvalidIcon>
              <WarningCircleSolid />
            </UI.InvalidIcon>
          </Tooltip>
        }

      </UI.DisconnectedBranchNode>
    </>
  )
}
