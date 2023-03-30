import { useEffect, useState } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Alert, StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'
import { AccessSwitchTable }                from '../AccessSwitchForm/AccessSwitchTable'
import { DistributionSwitchTable }          from '../DistributionSwitchForm/DistributionSwitchTable'
import * as UI                              from '../styledComponents'

import { SmartEdgeTable, SmartEdgeTableData } from './SmartEdgeTable'

export const SummaryForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const [smartEdgeData, setSmartEdgeData] = useState<SmartEdgeTableData[]>([])
  const nsgName = useWatch('name', form)
  const tags = useWatch('tags', form)
  const venueName = useWatch('venueName', form)
  const edgeName = useWatch('edgeName', form)
  const segments = useWatch('segments', form)
  const devices = useWatch('devices', form)
  const dhcpName = useWatch('dhcpName', form)
  const poolName = useWatch('poolName', form)
  const tunnelProfileName = useWatch('tunnelProfileName', form)
  const networkNames = useWatch('networkNames', form)
  const distributionSwitchInfos = useWatch('distributionSwitchInfos', form)
  const accessSwitchInfos = useWatch('accessSwitchInfos', form)

  useEffect(() => {
    setSmartEdgeData([
      {
        edgeName: edgeName,
        segments: segments.toString(),
        devices: devices.toString(),
        dhcpServiceName: dhcpName,
        dhcpPoolName: poolName
      }
    ])
  }, [edgeName, segments, devices, dhcpName, poolName])

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    <Alert message={
      $t({ defaultMessage: `For segment assignment for AP wired,
        please go to the Venue/ property Units page to assign an AP
        for the specific unit/ persona.` })
    }
    type='info'
    showIcon />
    <Subtitle level={4}>
      { $t({ defaultMessage: 'General Settings' }) }
    </Subtitle>
    <Row>
      <Col span={6}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'Service Name' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {nsgName}
        </UI.FieldValue>
      </Col>
      <Col span={6}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'Tags' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {tags?.join(', ')}
        </UI.FieldValue>
      </Col>
      <Col span={10}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'Venue with the property management enabled' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {venueName}
        </UI.FieldValue>
      </Col>
      <Col span={10}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'APs' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {''}
        </UI.FieldValue>
      </Col>
    </Row>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'SmartEdge' }) }
    </Subtitle>
    <Form.Item>
      <SmartEdgeTable data={smartEdgeData} />
    </Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Wireless Network' }) }
    </Subtitle>
    <Row>
      <Col span={6}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'Tunnel Profile' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {tunnelProfileName}
        </UI.FieldValue>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={24}>
        <UI.FieldTitle>
          {$t({ defaultMessage: 'Wireless Networks' })}
        </UI.FieldTitle>
        <UI.FieldValue>
          {networkNames?.map((item, index) => (
            <Row key={`networkNames-${index}`}>
              {item}
            </Row>
          ))}
        </UI.FieldValue>
      </Col>
    </Row>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Distribution Switch' }) }
    </Subtitle>
    <Form.Item>
      <DistributionSwitchTable type='form'
        dataSource={distributionSwitchInfos} /></Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Access Switch' }) }
    </Subtitle>
    <Form.Item>
      <AccessSwitchTable type='form'
        dataSource={accessSwitchInfos}/></Form.Item>
  </>)
}
