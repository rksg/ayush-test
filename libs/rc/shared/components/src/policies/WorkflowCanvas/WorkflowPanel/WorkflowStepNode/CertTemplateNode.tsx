import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { CertTemplateActionTypeIcon } from '@acx-ui/icons'
import { useGetActionByIdQuery,
  useGetCertificateTemplateQuery,
  useGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { ActionNodeDisplay, WorkflowPanelMode, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'
import * as UI            from './styledComponents'

export function CertTemplateNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()
  const isDesignMode = props.data.mode === WorkflowPanelMode.Design

  const { data } = useGetActionByIdQuery(
    { params: { actionId: props.data.enrollmentActionId } },
    { skip: !isDesignMode })

  const { data: certData } = useGetCertificateTemplateQuery({
    params: { policyId: data?.certTemplateId }
  },
  { skip: !isDesignMode || !data?.certTemplateId || data.valid === false })

  const { data: identityGroupData } =
    useGetPersonaGroupByIdQuery(
      { params: { groupId: data?.identityGroupId } },
      { skip: !isDesignMode || !data?.identityGroupId || data.valid === false })

  return (
    <BaseStepNode {...{ ...props }}>
      <BasicActionContent
        icon={<CertTemplateActionTypeIcon />}
        title={$t(ActionNodeDisplay.CERT_TEMPLATE)}
        content={isDesignMode
          ? <UI.Popover
            content={
              <Space direction='vertical' size={6}>
                <UI.PopoverTitle>
                  {$t({ defaultMessage: 'Identity Group' })}
                </UI.PopoverTitle>
                <UI.PopoverContent>
                  {identityGroupData ? identityGroupData.name : $t({ defaultMessage: 'None' })}
                </UI.PopoverContent>
                <UI.Spacer />
                <UI.PopoverTitle>
                  {$t({ defaultMessage: 'Certificate Service' })}
                </UI.PopoverTitle>
                <UI.PopoverContent>
                  {certData ? certData.name : $t({ defaultMessage: 'None' })}
                </UI.PopoverContent>
              </Space>
            }
            trigger='hover'
            overlayInnerStyle={{ backgroundColor: 'var(--acx-primary-black)' }}
            color='var(--acx-primary-black)'
          >
            {$t({ defaultMessage: 'Details' })}
          </UI.Popover> : undefined
        }
      />
    </BaseStepNode>
  )
}
