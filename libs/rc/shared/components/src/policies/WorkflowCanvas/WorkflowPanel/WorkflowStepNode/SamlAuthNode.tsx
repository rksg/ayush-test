import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { SamlAuthActionTypeIcon }          from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function SamlAuthNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props} >
      <BasicActionContent
        icon={<SamlAuthActionTypeIcon/>}
        title={$t(ActionNodeDisplay.IDP_AUTH_PROVIDER)}
      />
    </BaseStepNode>
  )
}
