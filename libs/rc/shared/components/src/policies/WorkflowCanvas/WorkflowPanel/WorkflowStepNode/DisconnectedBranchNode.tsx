
import { Row, Tooltip } from 'antd'
import { useIntl }      from 'react-intl'
import { NodeProps }    from 'reactflow'

import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Plus, WarningCircleSolid } from '@acx-ui/icons'

import * as UI from './styledComponents'

export default function DisconnectedBranchNode (props: NodeProps)
{

  const { $t } = useIntl()
  const workflowValidationEnhancementFFToggle
    = useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)



  return (
    <UI.DisconnectedBranchNode {...props} style={{ width: '100%', height: '100%' }}>

      <UI.DisconnectedBranchPlusButton>
        <Plus />
      </UI.DisconnectedBranchPlusButton>

      {workflowValidationEnhancementFFToggle &&
          <Tooltip
            showArrow={false}
            // @ts-ignore
            title={<Row>{ $t({ defaultMessage: 'This branch is diconnected from the rest of the '
              + 'workflow. Drag over another branch to connec them.' }) }</Row>}>
            <UI.InvalidIcon>
              <WarningCircleSolid />
            </UI.InvalidIcon>
          </Tooltip>
      }

    </UI.DisconnectedBranchNode>
  )
}
