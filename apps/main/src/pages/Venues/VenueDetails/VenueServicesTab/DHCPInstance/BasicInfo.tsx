import React, { useState, useRef } from 'react'

import { Col, Row, Typography, Button, FormInstance } from 'antd'
import _                                              from 'lodash'
import { useIntl }                                    from 'react-intl'
import { useLocation }                                from 'react-router-dom'

import { Modal }      from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import useDHCPInfo    from './hooks/useDHCPInfo'
import { RowWrapper } from './styledComponents'
import VenueDHCPForm  from './VenueDHCPForm'


export default function BasicInfo () {
  const { Title, Text, Paragraph } = Typography

  type LocationState = {
    showConfig?: boolean
  }
  const locationState:LocationState = useLocation().state as LocationState

  const [visible, setVisible] = useState(locationState?.showConfig ? true : false)
  const { $t } = useIntl()
  const TYPOGRAPHY_LEVEL = 4
  const DISPLAY_GATEWAY_MAX_NUM = 2
  const SPAN_NUM = 3
  let formRef = useRef<FormInstance>()
  const dhcpInfo = useDHCPInfo()
  const natGateway = _.take(dhcpInfo.gateway, DISPLAY_GATEWAY_MAX_NUM)

  return <>
    <RowWrapper>
      <Row gutter={24} justify='space-between' style={{ width: '100%' }}>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Name' })}</Text>
          </Title>
          <TenantLink
            to={`/services/dhcp/${dhcpInfo?.id}/detail`}>{dhcpInfo.name}
          </TenantLink>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Service Status' })}</Text>
          </Title>
          <Paragraph>
            {dhcpInfo.status? $t({ defaultMessage: 'ON' }): $t({ defaultMessage: 'OFF' }) }
          </Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP Configuration' })}</Text>
          </Title>
          <Paragraph>{dhcpInfo.configurationType}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'DHCP Pools' })}</Text>
          </Title>
          <Paragraph>{dhcpInfo.poolsNum}</Paragraph>
        </Col>

        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Primary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{dhcpInfo.primaryDHCP.name}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Secondary DHCP Server' })}</Text>
          </Title>
          <Paragraph>{dhcpInfo.secondaryDHCP.name}</Paragraph>
        </Col>
        <Col span={SPAN_NUM}>
          <Title level={TYPOGRAPHY_LEVEL}>
            <Text strong>{$t({ defaultMessage: 'Gateway' })}</Text>
          </Title>
          {natGateway.map((data)=>{
            return <Paragraph key={data.serialNumber}
              style={{ marginBottom: 5 }}>{ data.name }</Paragraph>
          })}
          { dhcpInfo.gateway.length>DISPLAY_GATEWAY_MAX_NUM && '...' }
        </Col>
        <Col span={SPAN_NUM}>
          <Button style={{ paddingLeft: 0 }}
            onClick={()=>{
              setVisible(true)
            }}
            type='link'
            block>
            {$t({ defaultMessage: 'Manage Local Service' })}
          </Button>
        </Col>
      </Row>
    </RowWrapper>
    <Modal
      title={$t({ defaultMessage: 'Manage Local DHCP for Wi-Fi Service' })}
      visible={visible}
      okText={$t({ defaultMessage: 'Apply' })}
      width={650}
      onCancel={() => {
        // const form = formRef as React.MutableRefObject<FormInstance>
        setVisible(false)
        // form.current.resetFields()
      }}
      onOk={() => {
        formRef?.current?.getFieldsValue()
        // form.current.submit()
        setVisible(false)
      }}
    >
      <VenueDHCPForm ref={formRef} />
    </Modal>
  </>
}
