import React, { useState, useRef } from 'react'

import { Typography, Button, FormInstance } from 'antd'
import _                                    from 'lodash'
import { useIntl }                          from 'react-intl'
import { useLocation }                      from 'react-router-dom'

import { Modal, GridRow, GridCol, Card } from '@acx-ui/components'
import { TenantLink }                    from '@acx-ui/react-router-dom'

import useDHCPInfo   from './hooks/useDHCPInfo'
import VenueDHCPForm from './VenueDHCPForm'


export default function BasicInfo () {
  const { Text, Paragraph } = Typography

  type LocationState = {
    showConfig?: boolean
  }
  const locationState:LocationState = useLocation().state as LocationState

  const [visible, setVisible] = useState(locationState?.showConfig ? true : false)
  const { $t } = useIntl()
  const DISPLAY_GATEWAY_MAX_NUM = 2
  const SPAN_NUM = 3
  let formRef = useRef<FormInstance>()
  const dhcpInfo = useDHCPInfo()
  const natGateway = _.take(dhcpInfo.gateway, DISPLAY_GATEWAY_MAX_NUM)

  return <>
    <Card type='solid-bg'>
      <GridRow justify='space-between' style={{ width: '100%' }}>
        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'Service Name' })}</Text>
          </Card.Title>
          <TenantLink
            to={`/services/dhcp/${dhcpInfo?.id}/detail`}>{dhcpInfo.name}
          </TenantLink>
        </GridCol>
        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'Service Status' })}</Text>
          </Card.Title>
          <Paragraph>
            {dhcpInfo.status? $t({ defaultMessage: 'ON' }): $t({ defaultMessage: 'OFF' }) }
          </Paragraph>
        </GridCol>

        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'DHCP Configuration' })}</Text>
          </Card.Title>
          <Paragraph>
            {dhcpInfo.configurationType ? $t(dhcpInfo.configurationType) : ''}
          </Paragraph>
        </GridCol>

        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'DHCP Pools' })}</Text>
          </Card.Title>
          <Paragraph>{dhcpInfo.poolsNum}</Paragraph>
        </GridCol>

        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'Primary DHCP Server' })}</Text>
          </Card.Title>
          <Paragraph>{dhcpInfo.primaryDHCP.name}</Paragraph>
        </GridCol>
        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'Secondary DHCP Server' })}</Text>
          </Card.Title>
          <Paragraph>{dhcpInfo.secondaryDHCP.name}</Paragraph>
        </GridCol>
        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            <Text strong>{$t({ defaultMessage: 'Gateway' })}</Text>
          </Card.Title>
          {natGateway.map((data)=>{
            return <Paragraph key={data.serialNumber}
              style={{ marginBottom: 5 }}>{ data.name }</Paragraph>
          })}
          { dhcpInfo.gateway.length>DISPLAY_GATEWAY_MAX_NUM && '...' }
        </GridCol>
        <GridCol col={{ span: SPAN_NUM }}>
          <Button style={{ paddingLeft: 0 }}
            onClick={()=>{
              setVisible(true)
            }}
            type='link'
            block>
            {$t({ defaultMessage: 'Manage Local Service' })}
          </Button>
        </GridCol>
      </GridRow>
    </Card>
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
