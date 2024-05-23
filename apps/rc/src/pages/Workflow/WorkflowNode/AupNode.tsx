
import { useIntl }              from 'react-intl'
import { useNodeId, NodeProps } from 'reactflow'

import { Loader }                          from '@acx-ui/components'
import { useGetActionByIdQuery }           from '@acx-ui/rc/services'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'
import { noDataDisplay }                   from '@acx-ui/utils'


import BaseActionNode from './BaseActionNode'



export default function AupNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const { data, isLoading, isFetching } = useGetActionByIdQuery({
    params: { actionId: props.data.enrollmentActionId }
  }, { skip: !props.data?.enrollmentActionId })

  return (
    <BaseActionNode {...props} name={data?.name}>
      <Loader states={[{ isLoading, isFetching }]}>
        <div>{$t(ActionNodeDisplay.AUP)}</div>
        <div>{` (${data?.name ?? noDataDisplay})`}</div>
      </Loader>
    </BaseActionNode>
  )
}
