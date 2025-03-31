import { useRef, useState } from 'react'

import { Button, Form }                from 'antd'
import { filter, find, isEmpty, take } from 'lodash'
import { useIntl }                     from 'react-intl'
import { useLocation, useParams }      from 'react-router-dom'

import { Modal, SummaryCard }                from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { ServiceConfigTemplateLinkSwitcher } from '@acx-ui/rc/components'
import {
  useGetDHCPProfileListQuery,
  useGetDhcpTemplateListQuery,
  useGetVenueSettingsQuery,
  useGetVenueTemplateSettingsQuery,
  useLazyGetDHCPProfileQuery,
  useLazyGetDhcpTemplateQuery,
  useUpdateVenueDHCPProfileMutation,
  useUpdateVenueTemplateDhcpProfileMutation,
  useGetVenueMeshQuery,
  useGetVenueTemplateMeshQuery
} from '@acx-ui/rc/services'
import {
  // eslint-disable-next-line max-len
  DHCPConfigTypeEnum, DHCPSaveData, DHCPUrls, LocationExtended, Mesh, ServiceOperation,ServiceType, VenueSettings,
  // eslint-disable-next-line max-len
  useConfigTemplate, useConfigTemplateLazyQueryFnSwitcher, useConfigTemplateMutationFnSwitcher, useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { WifiScopes }    from '@acx-ui/types'
import { hasPermission } from '@acx-ui/user'
import { getOpsApi }     from '@acx-ui/utils'

import { useVenueConfigTemplateQueryFnSwitcher } from '../../../venueConfigTemplateApiSwitcher'

import useDHCPInfo   from './hooks/useDHCPInfo'
import VenueDHCPForm from './VenueDHCPForm'

const useIsMeshEnabled = () => {
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? enableTemplateRbac : isWifiRbacEnabled

  const { data: venueWifiSetting } = useVenueConfigTemplateQueryFnSwitcher<VenueSettings>({
    useQueryFn: useGetVenueSettingsQuery,
    useTemplateQueryFn: useGetVenueTemplateSettingsQuery,
    skip: resolvedRbacEnabled
  })

  const { data: venueMeshSettings } = useVenueConfigTemplateQueryFnSwitcher<Mesh>({
    useQueryFn: useGetVenueMeshQuery,
    useTemplateQueryFn: useGetVenueTemplateMeshQuery,
    skip: !resolvedRbacEnabled
  })

  return (resolvedRbacEnabled
    ? venueMeshSettings?.enabled
    : venueWifiSetting?.mesh?.enabled) ?? false
}

interface DHCPFormRefType {
  resetForm: Function,
}
export default function BasicInfo () {
  const params = useParams()
  const locationState = (useLocation() as LocationExtended)?.state
  const { isTemplate } = useConfigTemplate()
  const [updateVenueDHCPProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateVenueDHCPProfileMutation,
    useTemplateMutationFn: useUpdateVenueTemplateDhcpProfileMutation
  })

  const [visible, setVisible] = useState(!!locationState?.from?.returnParams?.showConfig)
  const { $t } = useIntl()
  const DISPLAY_GATEWAY_MAX_NUM = 2
  const dhcpInfo = useDHCPInfo()
  const natGateway = take(dhcpInfo.gateway, DISPLAY_GATEWAY_MAX_NUM)
  const dhcpForm = useRef<DHCPFormRefType>()
  const [form] = Form.useForm()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const meshEnable = useIsMeshEnabled()

  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac

  const { data: dhcpProfileList } = useConfigTemplateQueryFnSwitcher<DHCPSaveData[]>({
    useQueryFn: useGetDHCPProfileListQuery,
    useTemplateQueryFn: useGetDhcpTemplateListQuery,
    skip: resolvedEnableRbac,
    enableRbac
  })

  const [getDhcpProfile] = useConfigTemplateLazyQueryFnSwitcher<DHCPSaveData | null>({
    useLazyQueryFn: useLazyGetDHCPProfileQuery,
    useLazyTemplateQueryFn: useLazyGetDhcpTemplateQuery
  })

  const getSelectedDHCP = async (dhcpServiceID:string)=> {
    if(resolvedEnableRbac) {
      const result = await getDhcpProfile({ params: { serviceId: dhcpServiceID },
        enableRbac: resolvedEnableRbac }).unwrap()
      return result
    }
    if(dhcpProfileList && dhcpServiceID){
      return find(dhcpProfileList, { id: dhcpServiceID })
    }else{
      return { dhcpMode: DHCPConfigTypeEnum.SIMPLE, dhcpPools: [] }
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
      id?: string;//venueID
      enabled?:Boolean
      serviceProfileId?:string
      dhcpServiceAps?: Array<object>,
      activeDhcpPoolNames?: Array<string>
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
      gateways = filter(gateways, o => !isEmpty(o.serialNumber) )
      if(!isEmpty(gateways) && payload.dhcpServiceAps){
        payload.dhcpServiceAps = payload.dhcpServiceAps.concat(gateways)
      }
    }
    return payload
  }

  const dhcpData = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: dhcpInfo.id && <ServiceConfigTemplateLinkSwitcher
        type={ServiceType.DHCP}
        oper={ServiceOperation.DETAIL}
        serviceId={dhcpInfo.id}
        children={dhcpInfo.name}
      />,
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
        onClick={() => setVisible(true)}
        type='link'
        block
        disabled={meshEnable}
        title={meshEnable
          // eslint-disable-next-line max-len
          ? $t({ defaultMessage: 'You cannot activate the DHCP service on this <venueSingular></venueSingular> because it already enabled mesh setting' })
          : ''
        }>{$t({ defaultMessage: 'Manage Local Service' })}</Button>,
      visible: hasPermission({
        scopes: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(DHCPUrls.bindVenueDhcpProfile)]
      })
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
            const { serviceProfileId: serviceId, enabled: enableService } = payload
            const selectedDhcp = payload.serviceProfileId ?
              await getSelectedDHCP(payload.serviceProfileId) : null
            if(selectedDhcp?.dhcpMode === DHCPConfigTypeEnum.SIMPLE || payload.enabled === false){
              delete payload.dhcpServiceAps
              if(payload.enabled === false){
                delete payload.serviceProfileId
              }
            }
            if (resolvedEnableRbac) {
              payload.activeDhcpPoolNames = selectedDhcp?.dhcpPools.map(pool => pool.name) || []
              delete payload.serviceProfileId
              delete payload.enabled
              delete payload.id
            }
            await updateVenueDHCPProfile({
              params: { ...params, serviceId },
              enableRbac: resolvedEnableRbac,
              payload, enableService
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
