import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DpskActionTypeIcon }   from '@acx-ui/icons'
import { useGetActionByIdQuery,
  useGetDpskQuery,
  useGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode                             from './BaseStepNode'
import BasicActionContent                       from './BasicActionContent'
import { PopoverContent, PopoverTitle, Spacer } from './styledComponents'




export function DpskNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  const { data } = useGetActionByIdQuery({ params: { actionId: props.data.enrollmentActionId } })

  const { data: dpskData } =
    useGetDpskQuery({ params: { serviceId: data?.dpskPoolId } }, { skip: !data?.dpskPoolId })
  const { data: identityGroupData } =
    useGetPersonaGroupByIdQuery(
      { params: { groupId: data?.identityGroupId } }, { skip: !data?.identityGroupId })

  return (
    <BaseStepNode {...{ ...props }}>
      <BasicActionContent
        icon={<DpskActionTypeIcon />}
        title={$t(ActionNodeDisplay.DPSK)}
        content={
          <Space direction='vertical' size={6}>
            <PopoverTitle>
              {$t({ defaultMessage: 'Identity Group' })}
            </PopoverTitle>
            <PopoverContent>
              {identityGroupData ? identityGroupData.name : $t({ defaultMessage: 'None' })}
            </PopoverContent>
            <Spacer />
            <PopoverTitle>
              {$t({ defaultMessage: 'DPSK Service' })}
            </PopoverTitle>
            <PopoverContent>
              {dpskData ? dpskData.name : $t({ defaultMessage: 'None' })}
            </PopoverContent>
          </Space>}
      />
    </BaseStepNode>
  )
}