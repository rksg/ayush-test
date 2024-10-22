import { Col, Form, Row, Space } from 'antd'
import { groupBy }               from 'lodash'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy, Subtitle, useStepFormContext }   from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable }                   from '@acx-ui/rc/components'
import { EdgeMdnsProxyViewData, MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

import { MdnsProxySummaryVenues } from '../../../MdnsProxySummary/MdnsProxySummaryVenue'

export function SummaryForm () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeMdnsProxyViewData>()
  const formValues = form.getFieldsValue(true) as EdgeMdnsProxyViewData

  const edgeCount = formValues.activations?.flatMap(item => item.edgeClusterId)?.length

  const venueGrouped = groupBy(formValues.activations, 'venueId')
  const scopeData = Object.entries(venueGrouped).map(([venueId, activations]) => {
    return {
      venueId,
      venueName: activations[0].venueName,
      aps: activations.map(item =>
        ({ serialNumber: item.edgeClusterId, name: item.edgeClusterName }))
    }
  })

  return (
    <>
      <StepsFormLegacy.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsFormLegacy.Title>
      <Space direction='vertical' size='middle'>
        <Row gutter={[24, 8]}>
          <Col span={24}>
            <Subtitle level={4}>{ $t({ defaultMessage: 'Settings' }) }</Subtitle>
          </Col>
          <Col span={12}>
            <Form.Item
              label={$t({ defaultMessage: 'Service Name:' })}
              children={formValues.name}
            />
          </Col>
          <Col span={20}>
            <Form.Item
              label={$t({ defaultMessage: 'Forwarding Rules:' })}
            >
              <MdnsProxyForwardingRulesTable
                featureType={MdnsProxyFeatureTypeEnum.EDGE}
                readonly={true}
                rules={formValues.forwardingRules}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>
              { $t({ defaultMessage: '<VenuePlural></VenuePlural> & RUCKUS Edges ({edgeCount})' },
                { edgeCount }) }
            </Subtitle>
          </Col>
          <Col span={14}>
            <MdnsProxySummaryVenues scope={scopeData ?? []} />
          </Col>
        </Row>
      </Space>
    </>
  )
}
