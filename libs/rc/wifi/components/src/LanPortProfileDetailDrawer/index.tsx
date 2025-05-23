/* eslint-disable max-len */

import { useEffect, useState } from 'react'

import { Divider, Form }             from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Drawer }                          from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetAAAPolicyViewModelListQuery,
  useGetApLanPortsWithActivatedProfilesQuery,
  useGetEthernetPortProfileByIdQuery,
  useGetEthernetPortProfileTemplateQuery
} from '@acx-ui/rc/services'
import {
  AAAViewModalType,
  EthernetPortAuthType,
  LanPort,
  PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  transformDisplayOnOff,
  useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

export interface LanPortDetailState {
  detailVisible: boolean
  apName: string
  serialNumber: string
  portId: string
  venueId: string
}

interface LanPortProfileDetailsDrawerProps {
  visible: boolean
  setVisible: (detailState: LanPortDetailState) => void
  portData: LanPortDetailState
}

const LanPortProfileDetailsDrawer = (props: LanPortProfileDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const {
    visible,
    setVisible,
    portData
  } = props
  const { apName, serialNumber, portId, venueId } = portData
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isSoftGREOnEthernetEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isIpSecOverNetworkEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isEthernetClientIsolationEnabled =
    useIsSplitOn(Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)

  const [targetLanPort, setTargetLanPort] = useState<LanPort>()

  const { data: apLanPortsData, isLoading: isApLanPortsLoading } =
  useGetApLanPortsWithActivatedProfilesQuery({
    params: { tenantId, serialNumber, venueId },
    enableRbac: isUseWifiRbacApi,
    enableEthernetProfile: isEthernetPortProfileEnabled,
    enableSoftGreOnEthernet: isSoftGREOnEthernetEnabled,
    enableIpsecOverNetwork: isIpSecOverNetworkEnabled,
    enableClientIsolationOnEthernet: isEthernetClientIsolationEnabled,
    skip: !visible
  })

  useEffect(() => {
    if (portId && !isApLanPortsLoading && apLanPortsData) {
      const targetPort = apLanPortsData.lanPorts?.find(l => l.portId === portId)
      if (targetPort) {
        setTargetLanPort(targetPort)
      }
    }
  }, [portId, apLanPortsData, isApLanPortsLoading])

  const onClose = () => {
    setVisible({
      ...portData,
      detailVisible: false
    })
  }

  // eslint-disable-next-line max-len
  const { radiusNameMap = [] } = useGetAAAPolicyViewModelListQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    },
    enableRbac: enableServicePolicyRbac
  }, {
    selectFromResult: ({ data }: { data?: { data: AAAViewModalType[] } }) => ({
      radiusNameMap: data?.data?.map(radius => ({ key: radius.id!, value: radius.name }))
    })
  })

  const { data: ethernetData } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEthernetPortProfileByIdQuery,
    useTemplateQueryFn: useGetEthernetPortProfileTemplateQuery,
    enableRbac: true,
    extraParams: { id: targetLanPort?.ethernetPortProfileId },
    skip: !targetLanPort?.ethernetPortProfileId
  })

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Ethernet Port Profile' })}
        children={(ethernetData?.name)
          ? (<TenantLink to={getPolicyDetailsLink({
            type: PolicyType.ETHERNET_PORT_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: targetLanPort?.ethernetPortProfileId! })}>
            {ethernetData?.name}
          </TenantLink>)
          : noDataDisplay
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Port Type' })}
        children={getEthernetPortTypeString(ethernetData?.type)}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Untag ID' })}
        children={ethernetData?.untagId ?? noDataDisplay}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Members' })}
        children={ethernetData?.vlanMembers ?? noDataDisplay}
      />

      <Form.Item
        label={$t({ defaultMessage: '802.1X' })}
        children={
          transformDisplayOnOff(!(ethernetData?.authType === EthernetPortAuthType.DISABLED ||
            ethernetData?.authType === EthernetPortAuthType.OPEN))
        }
      />
      {(ethernetData?.authType !== EthernetPortAuthType.DISABLED) &&
      <>
        <Divider/>

        {(ethernetData?.authType !== EthernetPortAuthType.OPEN) &&
          <Form.Item
            label={$t({ defaultMessage: '802.1X Role' })}
            children={getEthernetPortAuthTypeString(ethernetData?.authType)}
          />
        }

        {(ethernetData?.authType !== EthernetPortAuthType.SUPPLICANT) &&
        <>
          {(ethernetData?.authType !== EthernetPortAuthType.OPEN) &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'Authentication Service' })}
              children={
                (!targetLanPort?.authRadiusId)
                  ? noDataDisplay
                  : (
                    <TenantLink to={getPolicyDetailsLink({
                      type: PolicyType.AAA,
                      oper: PolicyOperation.DETAIL,
                      policyId: targetLanPort.authRadiusId })}>
                      {radiusNameMap.find(radius => radius.key === targetLanPort?.authRadiusId)?.value || noDataDisplay}
                    </TenantLink>)
              }
            />

            <Form.Item
              label={$t({ defaultMessage: 'Proxy Service (Auth)' })}
              children={transformDisplayOnOff(!!ethernetData?.enableAuthProxy)}
            />
          </>
          }

          <Form.Item
            label={$t({ defaultMessage: 'Accounting Service' })}
            children={
              (!targetLanPort?.accountingRadiusId)
                ? noDataDisplay
                : (
                  <TenantLink to={getPolicyDetailsLink({
                    type: PolicyType.AAA,
                    oper: PolicyOperation.DETAIL,
                    policyId: targetLanPort.accountingRadiusId })}>
                    {radiusNameMap.find(radius => radius.key === targetLanPort?.accountingRadiusId)?.value || noDataDisplay}
                  </TenantLink>)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service (Accounting)' })}
            children={transformDisplayOnOff(!!ethernetData?.enableAuthProxy)}
          />

          {ethernetData?.authType === EthernetPortAuthType.MAC_BASED &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Auth Bypass' })}
              children={transformDisplayOnOff(!!ethernetData?.bypassMacAddressAuthentication)}
            />

            <Form.Item
              label={$t({ defaultMessage: 'Dynamic VLAN' })}
              children={transformDisplayOnOff(!!ethernetData?.dynamicVlanEnabled)}
            />

            { ethernetData?.dynamicVlanEnabled &&
              <Form.Item
                label={$t({ defaultMessage: 'Guest VLAN' })}
                children={ethernetData?.unauthenticatedGuestVlan}
              />
            }
          </>
          }
        </>
        }
      </>
      }
      {
        <>
          <Divider/>

          <Form.Item
            label={$t({ defaultMessage: 'SoftGRE Tunnel' })}
            children={
              (<FormattedMessage
                defaultMessage={'{status} {leftQuote}<profileLink></profileLink>{rightQuote}'}
                values={{
                  status: transformDisplayOnOff(targetLanPort?.softGreEnabled!),
                  leftQuote: targetLanPort?.ipsecProfileName ? '(' : '',
                  rightQuote: targetLanPort?.ipsecProfileName ? ')' : '',
                  profileLink: () => targetLanPort?.softGreProfileId ?
                    <TenantLink to={getPolicyDetailsLink({
                      type: PolicyType.SOFTGRE,
                      oper: PolicyOperation.DETAIL,
                      policyId: targetLanPort?.softGreProfileId! })}>
                      {targetLanPort?.softGreProfileName}
                    </TenantLink> : ''
                }}/>)
            }
          />

          {targetLanPort?.softGreEnabled && <Form.Item
            label={$t({ defaultMessage: 'IPsec' })}
            children={
              (<FormattedMessage
                defaultMessage={'{status} {leftQuote}<profileLink></profileLink>{rightQuote}'}
                values={{
                  status: transformDisplayOnOff(targetLanPort?.ipsecEnabled!),
                  leftQuote: targetLanPort?.ipsecProfileName ? '(' : '',
                  rightQuote: targetLanPort?.ipsecProfileName ? ')' : '',
                  profileLink: () => targetLanPort.ipsecProfileId ?
                    <TenantLink to={getPolicyDetailsLink({
                      type: PolicyType.IPSEC,
                      oper: PolicyOperation.DETAIL,
                      policyId: targetLanPort?.ipsecProfileId! })}>
                      {targetLanPort?.ipsecProfileName}
                    </TenantLink> : ''
                }}/>)
            }
          />}

          <Form.Item
            label={$t({ defaultMessage: 'Client Isolation' })}
            children={transformDisplayOnOff(targetLanPort?.clientIsolationEnabled!)}
          />

          {targetLanPort?.clientIsolationEnabled && <Form.Item
            label={$t({ defaultMessage: 'Client Isolation Allowlist' })}
            children={
              (targetLanPort?.clientIsolationProfileName &&
             targetLanPort.clientIsolationProfileId) ?
                (<TenantLink to={getPolicyDetailsLink({
                  type: PolicyType.CLIENT_ISOLATION,
                  oper: PolicyOperation.DETAIL,
                  policyId: targetLanPort?.clientIsolationProfileId! })}>
                  {targetLanPort?.clientIsolationProfileName}
                </TenantLink>) :
                $t({ defaultMessage: 'Not active' })}
          />}
        </>
      }
    </Form>
  )

  return (
    <Drawer
      title={$t(
        { defaultMessage: '{apName} - LAN {portId}' },
        { apName, portId }
      )}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}

export default LanPortProfileDetailsDrawer