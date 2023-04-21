import { Col, Row, Descriptions as AntdDescriptions } from 'antd'
import { FormattedMessage, useIntl }                  from 'react-intl'
import styled                                         from 'styled-components'

import { Descriptions, StepsForm, useStepFormContext, Subtitle } from '@acx-ui/components'
import { SpaceWrapper }                                          from '@acx-ui/rc/components'
import { StatefulAcl }                                           from '@acx-ui/rc/utils'

import { FirewallFormModel, filterCustomACLRules } from '..'

import { Styles } from './styledComponents'


export const SummaryForm = styled(({ className }: { className?: string }) => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<FirewallFormModel>()
  const formValues = form.getFieldsValue(true)

  const activatedEdges = formValues.selectedEdges ?? []
  const edgeAmount = activatedEdges.length
  const ddosLimitEnabled = formValues.ddosRateLimitingEnabled
  const ddosRulesCount = formValues.ddosRateLimitingRules.length
  const statefulAclEnabled = formValues.statefulAclEnabled
  const customACLRules = filterCustomACLRules(formValues.statefulAcls ?? [])
  const statefulACLRulesCount = customACLRules.length

  return (
    <Row gutter={[10, 30]} className={className}>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>

        <Subtitle level={4}>
          { $t({ defaultMessage: 'Settings' }) }
        </Subtitle>

        <AntdDescriptions layout='vertical' className='flexDescriptions'>
          <AntdDescriptions.Item
            label={$t({ defaultMessage: 'Service Name' })}
          >
            {formValues.serviceName}
          </AntdDescriptions.Item>
          {/*
          <AntdDescriptions.Item
            label={$t({ defaultMessage: 'Tags' })}
          >
            {formValues.tags?.toString() ?? ''}
          </AntdDescriptions.Item>
          */}
        </AntdDescriptions>

        <Descriptions>
          <Descriptions.Item
            label={$t({ defaultMessage: 'DDoS Rate-limiting' })}
          >
            {
              ddosLimitEnabled
                ? $t({ defaultMessage: `{ddosLimitEnabled} 
                      ({ddosRulesCount} {ddosRulesCount, plural, one {Rule} other {Rules}})` },
                {
                  ddosLimitEnabled: <FormattedMessage defaultMessage='ON' />,
                  ddosRulesCount
                })
                : $t({ defaultMessage: 'OFF' })
            }
          </Descriptions.Item>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Stateful ACL' })}
          >
            {
              statefulAclEnabled
                ? $t({ defaultMessage: '{statefulAclEnabled} ({statefulACLRulesCount} ACL)' },
                  {
                    statefulAclEnabled: <FormattedMessage defaultMessage='ON' />,
                    statefulACLRulesCount
                  })
                : $t({ defaultMessage: 'OFF' })
            }
          </Descriptions.Item>
        </Descriptions>
      </Col>

      <Col span={24}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'SmartEdge ({edgeAmount})' }, { edgeAmount }) }
        </Subtitle>
        <Descriptions>
          <Descriptions.NoLabel>
            <SpaceWrapper direction='vertical' size='small'>
              {activatedEdges.map((item: { name: string }) => item.name)}
            </SpaceWrapper>
          </Descriptions.NoLabel>
        </Descriptions>
      </Col>
    </Row>
  )
})`${Styles}`
