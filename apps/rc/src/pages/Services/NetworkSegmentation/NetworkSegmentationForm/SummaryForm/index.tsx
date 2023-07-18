import { useEffect, useState } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'
import styled             from 'styled-components'

import { Alert, StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'
import { AccessSwitchTable, AccessSwitchTableDataType }   from '@acx-ui/rc/components'

import { NetworkSegmentationGroupFormData } from '..'
import { useWatch }                         from '../../useWatch'
import { DistributionSwitchTable }          from '../DistributionSwitchForm/DistributionSwitchTable'
import * as UI                              from '../styledComponents'

import { SmartEdgeTable, SmartEdgeTableData } from './SmartEdgeTable'

const SummaryStepTitle = styled(Subtitle).attrs({ level: 4 })`
  margin-top: 1.2em;
`

export const SummaryForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const [smartEdgeData, setSmartEdgeData] = useState<SmartEdgeTableData[]>([])
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
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
      $t({ defaultMessage: `For segment assignment for AP wired,
        please go to the Venue/ property Units page to assign an AP
        for the specific unit/ persona.` })
    }
    type='info'
    showIcon />
    <SummaryStepTitle>
      { $t({ defaultMessage: 'General Settings' }) }
    </SummaryStepTitle>
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
    <SummaryStepTitle>
      { $t({ defaultMessage: 'SmartEdge' }) }
    </SummaryStepTitle>
    <Form.Item>
      <SmartEdgeTable data={smartEdgeData} />
    </Form.Item>
    <SummaryStepTitle>
      { $t({ defaultMessage: 'Wireless Network' }) }
    </SummaryStepTitle>
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
          {$t({ defaultMessage: 'Wireless Networks ({num})' },
            { num: networkNames?.length??0 })}
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
    <SummaryStepTitle>
      { $t({ defaultMessage: 'Distribution Switch ({num})' },
        { num: distributionSwitchInfos?.length??0 }) }
    </SummaryStepTitle>
    { distributionSwitchInfos?.length && <Form.Item>
      <DistributionSwitchTable type='form'
        dataSource={distributionSwitchInfos} /></Form.Item>}
    <SummaryStepTitle>
      { $t({ defaultMessage: 'Access Switch ({num})' },
        { num: accessSwitchData?.length??0 }) }
    </SummaryStepTitle>
    { accessSwitchData?.length && <Form.Item>
      <AccessSwitchTable type='form'
        dataSource={accessSwitchData} /></Form.Item>}

  </>)
}
