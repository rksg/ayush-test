import { useEffect, useState } from 'react'

import { Col, Form, Row }            from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import styled                        from 'styled-components'

import { Alert, StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'
import { AccessSwitchTable, AccessSwitchTableDataType }   from '@acx-ui/rc/components'
import { AccessSwitch, DistributionSwitch }               from '@acx-ui/rc/utils'

import { NetworkSegmentationGroupFormData } from '..'
import { DistributionSwitchTable }          from '../DistributionSwitchForm/DistributionSwitchTable'
import { Sub5Bold }                         from '../GeneralSettingsForm/styledComponents'

import { SmartEdgeTable, SmartEdgeTableData } from './SmartEdgeTable'
styled(Subtitle).attrs({ level: 4 })`
  margin-top: 1.2em;
`
export const SummaryForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const [smartEdgeData, setSmartEdgeData] = useState<SmartEdgeTableData[]>([])
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
  const nsgName = form.getFieldValue('name')
  const venueName = form.getFieldValue('venueName')
  const edgeName = form.getFieldValue('edgeName')
  const segments = form.getFieldValue('segments')
  const devices = form.getFieldValue('devices')
  const dhcpName = form.getFieldValue('dhcpName')
  const poolName = form.getFieldValue('poolName')
  const tunnelProfileName = form.getFieldValue('tunnelProfileName')
  const networkNames = form.getFieldValue('networkNames') as string[]
  const distributionSwitchInfos = form.getFieldValue(
    'distributionSwitchInfos'
  ) as DistributionSwitch[]
  const accessSwitchInfos = form.getFieldValue('accessSwitchInfos') as AccessSwitch []

  const alertMsg = <FormattedMessage
    defaultMessage={
      'For segment assignment for <sub5b>AP wired</sub5b>,\
      please go to the <sub5b>Venue/ property Units page</sub5b> to assign an AP\
      for the specific unit/ persona.'}

    values={{
      sub5b: (content) => <Sub5Bold >{content}</Sub5Bold>
    }}
  />

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

  useEffect(() => {
    setAccessSwitchData(accessSwitchInfos?.map(as => ({
      ...as,
      distributionSwitchName: distributionSwitchInfos
        ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
    })))
  }, [accessSwitchInfos, distributionSwitchInfos])

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    <Alert message={
      alertMsg
    }
    type='info'
    showIcon />
    <Subtitle level={4}>
      { $t({ defaultMessage: 'General Settings' }) }
    </Subtitle>
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Service Name' })} children={nsgName} />
      </Col>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Venue with the property management enabled' })}
          children={venueName} />
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
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Tunnel Profile' })} children={tunnelProfileName} />
      </Col>
    </Row>
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Wireless Networks ({num})' },
          { num: networkNames?.length??0 })}
        children={networkNames?.length??0 == 0 ? '0' : networkNames?.map((item, index) => (
          <Row key={`networkNames-${index}`}>
            {item}
          </Row>
        ))}
        />
      </Col>
    </Row>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Distribution Switch ({num})' },
        { num: distributionSwitchInfos?.length??0 }) }
    </Subtitle>
    { distributionSwitchInfos?.length && <Form.Item>
      <DistributionSwitchTable type='form'
        dataSource={distributionSwitchInfos} /></Form.Item>}
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Access Switch ({num})' },
        { num: accessSwitchData?.length??0 }) }
    </Subtitle>
    { accessSwitchData?.length && <Form.Item>
      <AccessSwitchTable type='form'
        dataSource={accessSwitchData} /></Form.Item>}

  </>)
}
