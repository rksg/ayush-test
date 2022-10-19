import React, { useState, useRef } from 'react'

import { Col, Row, Typography, Button, FormInstance } from 'antd'
import _                                              from 'lodash'
import { useIntl }                                    from 'react-intl'
import { useParams }                                  from 'react-router-dom'

import { Modal }                                            from '@acx-ui/components'
import { useVenueDHCPProfileQuery, useGetDHCPProfileQuery } from '@acx-ui/rc/services'
import { DHCPConfigTypeMessages }                           from '@acx-ui/rc/utils'
import { TenantLink }                                       from '@acx-ui/react-router-dom'

import { RowWrapper } from './styledComponents'
import VenueDHCPForm  from './VenueDHCPForm'


export default function BasicInfo () {
  const params = useParams()
  const { Title, Text, Paragraph } = Typography
  const [visible, setVisible] = useState(false)

  const { $t } = useIntl()
  const TYPOGRAPHY_LEVEL = 4
  const SPAN_NUM = 3
  // const form = Form.useFormInstance()
  const form = useRef<FormInstance>()
  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params: { venueId: params.venueId }
  })

  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { serviceId: venueDHCPProfile?.serviceProfileId }
  })

  const displayData = {
    name: dhcpProfile?.name,
    status: venueDHCPProfile?.enabled === true,
    configurationType: dhcpProfile ? DHCPConfigTypeMessages[dhcpProfile.dhcpConfig]:'',
    poolsNum: dhcpProfile? dhcpProfile?.dhcpPools.length : 0,
    // eslint-disable-next-line max-len
    primaryDHCP: venueDHCPProfile?.dhcpServiceAps[_.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'PrimaryServer' })].serialNumber,
    // eslint-disable-next-line max-len
    secondaryDHCP: venueDHCPProfile?.dhcpServiceAps[_.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'BackupServer' })].serialNumber,
    // eslint-disable-next-line max-len
    natGateway: venueDHCPProfile?.dhcpServiceAps[_.findIndex(venueDHCPProfile?.dhcpServiceAps, { role: 'NatGateway' })].serialNumber
  }


  return <>
    <RowWrapper>
      <Row gutter={24} justify='space-between' style={{ width: '100%' }}>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Name' })}</Text>
          </Title>
          <TenantLink
            to={`/services/dhcp/${venueDHCPProfile?.serviceProfileId}/detail`}>{displayData.name}
          </TenantLink>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Status' })}</Text>
          </Title>
          <Paragraph>
            {displayData.status? $t({ defaultMessage: 'ON' }): $t({ defaultMessage: 'OFF' }) }
          </Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP Configuration' })}</Text>
          </Title>
          <Paragraph>{displayData.configurationType}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP Pools' })}</Text>
          </Title>
          <Paragraph>{displayData.poolsNum}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Primary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{displayData.primaryDHCP}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Secondary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{displayData.secondaryDHCP}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Gateway' })}</Text>
          </Title>
          <Paragraph>{displayData.natGateway}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <div>
            <Button onClick={()=>{
              setVisible(true)
            }}
            type='link'
            block>
              {$t({ defaultMessage: 'Manage Local Service' })}
            </Button>
          </div>
        </Col>
      </Row>
    </RowWrapper>
    <Modal
      title={$t({ defaultMessage: 'Manage Local DHCP for Wi-Fi Service' })}
      visible={visible}
      okText={$t({ defaultMessage: 'Apply' })}
      width={650}
      onCancel={() => {
        setVisible(false)
        // form.resetFields()
      }}
      onOk={() => {
        // form?.current?.validateFields()
        //   .then(values=>{
        //     console.log(values)
        //   })
      }}
    >
      <VenueDHCPForm/>
    </Modal>
  </>
}
