
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { AupActionTypeIcon }               from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'


import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function AupNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props}>
      <BasicActionContent
        icon={<AupActionTypeIcon/>}
        title={$t(ActionNodeDisplay.AUP)}
        content={$t({ defaultMessage: '(AUP)' })}
      />
    </BaseStepNode>
  )
}
