
import { useIntl }              from 'react-intl'
import { useNodeId, NodeProps } from 'reactflow'

import { Loader }                          from '@acx-ui/components'
import { AupIcon }                         from '@acx-ui/icons'
import { useGetActionByIdQuery }           from '@acx-ui/rc/services'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'
import { noDataDisplay }                   from '@acx-ui/utils'


import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function AupNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const { data, isLoading, isFetching } = useGetActionByIdQuery({
    params: { actionId: props.data.enrollmentActionId }
  }, { skip: !props.data?.enrollmentActionId })

  return (
    <BaseStepNode {...props} name={data?.name}>
      <Loader states={[{ isLoading, isFetching }]}>
        <BasicActionContent
          icon={<AupIcon/>}
          title={$t(ActionNodeDisplay.AUP)}
          content={` (${data?.name ?? noDataDisplay})`}
        />
      </Loader>
    </BaseStepNode>
  )
}
