import { useRef, useState } from 'react'

import { Button, Form }           from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useLocation, useParams } from 'react-router-dom'

import { Modal, SummaryCard }         from '@acx-ui/components'
import {
  useGetDHCPProfileListQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueDHCPProfileMutation
} from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { TenantLink }         from '@acx-ui/react-router-dom'

import useDHCPInfo   from './hooks/useDHCPInfo'
import VenueDHCPForm from './VenueDHCPForm'

interface DHCPFormRefType {
  resetForm: Function,
}
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
  const dhcpInfo = useDHCPInfo()
  const natGateway = _.take(dhcpInfo.gateway, DISPLAY_GATEWAY_MAX_NUM)
  const dhcpForm = useRef<DHCPFormRefType>()
  const [form] = Form.useForm()
  const { data: venue } = useGetVenueSettingsQuery({ params })
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
  const meshEnable = venue?.mesh?.enabled

  const dhcpData = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: <TenantLink
        to={`/services/dhcp/${dhcpInfo?.id}/detail`}>{dhcpInfo.name}
      </TenantLink>,
      visible: dhcpInfo.status
    },
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: dhcpInfo.status? $t({ defaultMessage: 'ON' }): $t({ defaultMessage: 'OFF' })
    },
    {
      title: $t({ defaultMessage: 'DHCP Configuration' }),
      content: dhcpInfo.configurationType ? $t(dhcpInfo.configurationType) : '',
      visible: dhcpInfo.status
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      content: dhcpInfo.poolsNum,
      visible: dhcpInfo.status
    },
    {
      title: $t({ defaultMessage: 'Primary DHCP Server' }),
      content: dhcpInfo.primaryDHCP.name,
      visible: dhcpInfo.status
    },
    {
      title: $t({ defaultMessage: 'Secondary DHCP Server' }),
      content: dhcpInfo.secondaryDHCP.name,
      visible: dhcpInfo.status
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      content: <>
        {natGateway.map((data, i) => (<span key={i}>{ data.name }<br /></span>))}
        { dhcpInfo.gateway.length>DISPLAY_GATEWAY_MAX_NUM && '...' }
      </>,
      visible: dhcpInfo.status
    },
    {
      custom: <Button style={{ paddingLeft: 0, margin: 'auto' }}
        onClick={()=>{
          setVisible(true)
        }}
        type='link'
        disabled={meshEnable}
        title={meshEnable?$t({ defaultMessage: 'You cannot activate the DHCP service on this'+
        ' venue because it already enabled mesh setting' }):''}
        block>
        {$t({ defaultMessage: 'Manage Local Service' })}
      </Button>,
      visible: true
    }
  ]

  return <>
    <SummaryCard data={dhcpData} />
    <Modal
      title={$t({ defaultMessage: 'Manage Local DHCP for Wi-Fi Service' })}
      visible={visible}
      okText={$t({ defaultMessage: 'Apply' })}
      width={650}
      onCancel={() => {
        setVisible(false)
        dhcpForm.current?.resetForm()
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
      <VenueDHCPForm form={form} ref={dhcpForm} />
    </Modal>
  </>
}
