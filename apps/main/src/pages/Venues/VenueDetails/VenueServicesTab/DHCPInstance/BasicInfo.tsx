import React, { useState } from 'react'

import { Button, Form }           from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useLocation, useParams } from 'react-router-dom'

import { Modal, GridRow, GridCol, Card } from '@acx-ui/components'
import {
  useUpdateVenueDHCPProfileMutation,
  useGetDHCPProfileListQuery
} from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { hasAccess }          from '@acx-ui/user'

import useDHCPInfo   from './hooks/useDHCPInfo'
import VenueDHCPForm from './VenueDHCPForm'


export default function BasicInfo () {
  type LocationState = {
    showConfig?: boolean
  }
  const params = useParams()
  const locationState:LocationState = useLocation().state as LocationState

  const [updateVenueDHCPProfile] = useUpdateVenueDHCPProfileMutation()

  const [visible, setVisible] = useState(locationState?.showConfig ? true : false)
  const { $t } = useIntl()
  const DISPLAY_GATEWAY_MAX_NUM = 2
  const SPAN_NUM = 3
  const dhcpInfo = useDHCPInfo()
  const natGateway = _.take(dhcpInfo.gateway, DISPLAY_GATEWAY_MAX_NUM)

  const [form] = Form.useForm()

  const { data: dhcpProfileList } = useGetDHCPProfileListQuery({ params })
  const getSelectedDHCPMode = (dhcpServiceID:string)=> {
    if(dhcpProfileList && dhcpServiceID){
      return _.find(dhcpProfileList, { id: dhcpServiceID })?.dhcpMode
    }else{
      return DHCPConfigTypeEnum.SIMPLE
    }
  }

  const payloadTransverter = (data:{
    enabled: boolean;
    serviceProfileId: string;
    primaryServerSN: string;
    backupServerSN: string;
    gateways:[];
  })=>{
    const payload:{
      id: string;//venueID
      enabled:Boolean
      serviceProfileId?:string
      dhcpServiceAps?: Array<object>
    } = {
      enabled: data.enabled,
      serviceProfileId: data.serviceProfileId,
      dhcpServiceAps: [],
      id: params.venueId ? params.venueId : ''
    }

    if(data.primaryServerSN && payload.dhcpServiceAps){
      payload.dhcpServiceAps.push({
        serialNumber: data.primaryServerSN,
        role: 'PrimaryServer'
      })
    }
    if(data.backupServerSN && payload.dhcpServiceAps){
      payload.dhcpServiceAps.push({
        serialNumber: data.backupServerSN,
        role: 'BackupServer'
      })
    }

    if(data.gateways){
      let gateways = data.gateways.map((item:{ serialNumber:string }) => {
        if(item.serialNumber){
          return {
            serialNumber: item.serialNumber,
            role: 'NatGateway'
          }
        }
        return {}
      })
      gateways = _.filter(gateways, o => !_.isEmpty(o.serialNumber) )
      if(!_.isEmpty(gateways) && payload.dhcpServiceAps){
        payload.dhcpServiceAps = payload.dhcpServiceAps.concat(gateways)
      }
    }
    return payload
  }

  return <>
    <Card type='solid-bg'>
      <GridRow justify='space-between'>
        {dhcpInfo.status && <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            {$t({ defaultMessage: 'Service Name' })}
          </Card.Title>
          <TenantLink
            to={`/services/dhcp/${dhcpInfo?.id}/detail`}>{dhcpInfo.name}
          </TenantLink>
        </GridCol>}

        <GridCol col={{ span: SPAN_NUM }}>
          <Card.Title>
            {$t({ defaultMessage: 'Service Status' })}
          </Card.Title>
          {dhcpInfo.status? $t({ defaultMessage: 'ON' }): $t({ defaultMessage: 'OFF' }) }
        </GridCol>

        {dhcpInfo.status && <>
          <GridCol col={{ span: SPAN_NUM }}>
            <Card.Title>
              {$t({ defaultMessage: 'DHCP Configuration' })}
            </Card.Title>
            {dhcpInfo.configurationType ? $t(dhcpInfo.configurationType) : ''}
          </GridCol>

          <GridCol col={{ span: SPAN_NUM }}>
            <Card.Title>
              {$t({ defaultMessage: 'DHCP Pools' })}
            </Card.Title>
            {dhcpInfo.poolsNum}
          </GridCol>

          <GridCol col={{ span: SPAN_NUM }}>
            <Card.Title>
              {$t({ defaultMessage: 'Primary DHCP Server' })}
            </Card.Title>
            {dhcpInfo.primaryDHCP.name}
          </GridCol>
          <GridCol col={{ span: SPAN_NUM }}>
            <Card.Title>
              {$t({ defaultMessage: 'Secondary DHCP Server' })}
            </Card.Title>
            {dhcpInfo.secondaryDHCP.name}
          </GridCol>
          <GridCol col={{ span: SPAN_NUM }}>
            <Card.Title>
              {$t({ defaultMessage: 'Gateway' })}
            </Card.Title>
            {natGateway.map((data, i) => (<span key={i}>{ data.name }<br /></span>))}
            { dhcpInfo.gateway.length>DISPLAY_GATEWAY_MAX_NUM && '...' }
          </GridCol>
        </>}
        <GridCol col={{ span: SPAN_NUM }}>
          {hasAccess() &&
            <Button style={{ paddingLeft: 0 }}
              onClick={()=>{
                setVisible(true)
              }}
              type='link'
              block>
              {$t({ defaultMessage: 'Manage Local Service' })}
            </Button>
          }
        </GridCol>
      </GridRow>
    </Card>
    <Modal
      title={$t({ defaultMessage: 'Manage Local DHCP for Wi-Fi Service' })}
      visible={visible}
      okText={$t({ defaultMessage: 'Apply' })}
      width={650}
      onCancel={() => {
        setVisible(false)
        form.resetFields()
      }}
      onOk={async () => {
        try {
          const valid = await form.validateFields()
          if (valid) {
            const payload = payloadTransverter(form.getFieldsValue())
            const profileMode = payload.serviceProfileId ?
              getSelectedDHCPMode(payload.serviceProfileId) : null
            if(profileMode === DHCPConfigTypeEnum.SIMPLE || payload.enabled === false){
              delete payload.dhcpServiceAps
              if(payload.enabled === false){
                delete payload.serviceProfileId
              }
            }
            await updateVenueDHCPProfile({
              params: { ...params }, payload
            }).unwrap()
            setVisible(false)
          }
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }}
    >
      <VenueDHCPForm form={form} />
    </Modal>
  </>
}
