import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row }            from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import styled                        from 'styled-components'

import { Alert, StepsForm, Subtitle, useStepFormContext }                    from '@acx-ui/components'
import { AccessSwitchTable, AccessSwitchTableDataType }                      from '@acx-ui/rc/components'
import { AccessSwitch, DistributionSwitch, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'

import { DistributionSwitchTable }            from '../DistributionSwitchForm/DistributionSwitchTable'
import { Sub5Bold }                           from '../GeneralSettingsForm/styledComponents'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { SmartEdgeTable, SmartEdgeTableData } from './SmartEdgeTable'
styled(Subtitle).attrs({ level: 4 })`
  margin-top: 1.2em;
`
export const SummaryForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const {
    getVenueName,
    getClusterName,
    getDhcpName,
    getTunnelProfileName,
    getNetworksName
  } = useContext(PersonalIdentityNetworkFormContext)
  const [smartEdgeData, setSmartEdgeData] = useState<SmartEdgeTableData[]>([])
  const [accessSwitchData, setAccessSwitchData] = useState<AccessSwitchTableDataType[]>([])
  const pinName = form.getFieldValue('name')
  const venueId = form.getFieldValue('venueId')
  const edgeClusterId = form.getFieldValue('edgeClusterId')
  const segments = form.getFieldValue('segments')
  const dhcpId = form.getFieldValue('dhcpId')
  const poolId = form.getFieldValue('poolId')
  const tunnelProfileId = form.getFieldValue('vxlanTunnelProfileId')
  const networkIds = form.getFieldValue('networkIds')
  const poolName = form.getFieldValue('poolName')

  const distributionSwitchInfos = form.getFieldValue(
    'distributionSwitchInfos'
  ) as DistributionSwitch[]
  const accessSwitchInfos = form.getFieldValue('accessSwitchInfos') as AccessSwitch []

  const alertMsg = <FormattedMessage
    defaultMessage={
      'For segment assignment for <sub5b>AP wired</sub5b>, please go to the\
      <sub5b><VenueSingular></VenueSingular>/ Property Units page</sub5b> to assign an AP\
      for the specific unit / identity.'}

    values={{
      sub5b: (content) => <Sub5Bold >{content}</Sub5Bold>
    }}
  />

  useEffect(() => {
    setSmartEdgeData([
      {
        edgeName: getClusterName(edgeClusterId),
        segments: segments.toString(),
        dhcpServiceName: getDhcpName(dhcpId),
        dhcpPoolName: poolName.toString()
      }
    ])
  }, [edgeClusterId, segments, dhcpId, poolId, poolName])

  useEffect(() => {
    setAccessSwitchData(accessSwitchInfos?.map(as => ({
      ...as,
      distributionSwitchName: distributionSwitchInfos
        ?.find(ds => ds.id === as.distributionSwitchId)?.name || ''
    })))
  }, [accessSwitchInfos, distributionSwitchInfos])

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    <Alert message={alertMsg} type='info' showIcon />
    <Subtitle level={4}>
      { $t({ defaultMessage: 'General Settings' }) }
    </Subtitle>
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Service Name' })} children={pinName} />
      </Col>
      <Col flex={1}>{/* eslint-disable-next-line max-len */}
        <Form.Item label={$t({ defaultMessage: '<VenueSingular></VenueSingular> with the property management enabled' })}
          children={getVenueName(venueId)} />
      </Col>
    </Row>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'RUCKUS Edge' }) }
    </Subtitle>
    <Form.Item>
      <SmartEdgeTable data={smartEdgeData} />
    </Form.Item>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Wireless Network' }) }
    </Subtitle>
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item
          label={$t({ defaultMessage: 'Tunnel Profile' })}
          children={getTunnelProfileName(tunnelProfileId)}
        />
      </Col>
    </Row>
    <Row gutter={20}>
      <Col flex={1}>
        <Form.Item label={$t({ defaultMessage: 'Wireless Networks ({num})' },
          { num: networkIds?.length??0 })}
        children={
          (networkIds?.length ?? 0) === 0 ? '0' :
            getNetworksName(networkIds)?.map((item, index) => (
              <Row key={`networkNames-${index}`}>
                {item}
              </Row>
            ))
        }
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
        dataSource={accessSwitchData} />
    </Form.Item>}
  </>)
}