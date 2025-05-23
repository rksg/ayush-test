/* eslint-disable max-len */

import { useEffect, useMemo, useState } from 'react'

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
  EthernetPortProfileViewData,
  LanPort,
  PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortCredentialTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  transformDisplayOnOff,
  useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface LanPortProfileDetailsDrawerProps {
  title: string
  visible: boolean
  setVisible: (visible: boolean) => void
  wiredPortVisible?: boolean
  ethernetPortProfileData?: EthernetPortProfileViewData
  serialNumber?: string
  portId?: string
  venueId?: string
}

const LanPortProfileDetailsDrawer = (props: LanPortProfileDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const {
    title,
    visible,
    setVisible,
    wiredPortVisible=false,
    portId,
    venueId,
    serialNumber,
    ethernetPortProfileData
  } = props
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableClientVisibility = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)
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
    skip: !wiredPortVisible
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
    setVisible(false)
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
    extraParams: { id: ethernetPortProfileData?.id || targetLanPort?.ethernetPortProfileId },
    skip: !ethernetPortProfileData?.id && !targetLanPort?.ethernetPortProfileId
  })

  const ethernetDataForDisplay = useMemo(() => ({
    ...ethernetData,
    ...ethernetPortProfileData
  }), [ethernetData, ethernetPortProfileData])

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
    >
      <Form.Item
        label={wiredPortVisible ?
          $t({ defaultMessage: 'Ethernet Port Profile' }) :
          $t({ defaultMessage: 'Name' })}
        children={
          (wiredPortVisible && ethernetDataForDisplay?.name)
            ? (<TenantLink to={getPolicyDetailsLink({
              type: PolicyType.ETHERNET_PORT_PROFILE,
              oper: PolicyOperation.DETAIL,
              policyId: targetLanPort?.ethernetPortProfileId! })}>
              {ethernetDataForDisplay?.name}
            </TenantLink>)
            : ''
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Port Type' })}
        children={getEthernetPortTypeString(ethernetDataForDisplay?.type)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Untag ID' })}
        children={ethernetDataForDisplay?.untagId}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Members' })}
        children={ethernetDataForDisplay?.vlanMembers}
      />

      <Form.Item
        label={$t({ defaultMessage: '802.1X' })}
        children={
          transformDisplayOnOff(!(ethernetDataForDisplay?.authType === EthernetPortAuthType.DISABLED ||
           ethernetDataForDisplay?.authType === EthernetPortAuthType.OPEN))
        }
      />
      {!wiredPortVisible && enableClientVisibility &&
        <Form.Item
          label={$t({ defaultMessage: 'Client Visibility' })}
          children={
            transformDisplayOnOff(ethernetDataForDisplay?.authType === EthernetPortAuthType.OPEN ||
            ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED ||
            ethernetDataForDisplay?.authType === EthernetPortAuthType.PORT_BASED)
          }
        />
      }
      {!(ethernetDataForDisplay?.authType === EthernetPortAuthType.DISABLED ||
       ethernetDataForDisplay?.authType === EthernetPortAuthType.OPEN) &&
      <>
        <Divider/>

        <Form.Item
          label={$t({ defaultMessage: '802.1X Role' })}
          children={getEthernetPortAuthTypeString(ethernetDataForDisplay?.authType)}
        />

        {ethernetDataForDisplay?.authType === EthernetPortAuthType.SUPPLICANT &&
        <Form.Item
          label={$t({ defaultMessage: 'Credential Type' })}
          children={getEthernetPortCredentialTypeString(ethernetDataForDisplay?.supplicantAuthenticationOptions?.type)}
        />
        }
        {!(ethernetDataForDisplay?.authType === EthernetPortAuthType.SUPPLICANT) &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'Authentication Service' })}
            children={
              (!ethernetDataForDisplay?.authRadiusId)
                ? ''
                : (
                  <TenantLink to={getPolicyDetailsLink({
                    type: PolicyType.AAA,
                    oper: PolicyOperation.DETAIL,
                    policyId: ethernetDataForDisplay.authRadiusId })}>
                    {radiusNameMap.find(radius => radius.key === ethernetDataForDisplay?.authRadiusId)?.value || ''}
                  </TenantLink>)
            }
          />

          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service (Auth)' })}
            children={transformDisplayOnOff(!!ethernetDataForDisplay?.enableAuthProxy)}
          />

          <Form.Item
            label={$t({ defaultMessage: 'Accounting Service' })}
            children={
              (!ethernetDataForDisplay?.accountingRadiusId)
                ? '-'
                : (
                  <TenantLink to={getPolicyDetailsLink({
                    type: PolicyType.AAA,
                    oper: PolicyOperation.DETAIL,
                    policyId: ethernetDataForDisplay.accountingRadiusId })}>
                    {radiusNameMap.find(radius => radius.key === ethernetDataForDisplay?.accountingRadiusId)?.value || ''}
                  </TenantLink>)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service (Accounting)' })}
            children={transformDisplayOnOff(!!ethernetDataForDisplay?.enableAuthProxy)}
          />

          {ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Auth Bypass' })}
              children={transformDisplayOnOff(!!ethernetDataForDisplay?.bypassMacAddressAuthentication)}
            />

            {ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED &&
              <>
                <Form.Item
                  label={$t({ defaultMessage: 'Dynamic VLAN' })}
                  children={transformDisplayOnOff(!!ethernetDataForDisplay?.dynamicVlanEnabled)}
                />
                { ethernetDataForDisplay?.dynamicVlanEnabled &&
                  <Form.Item
                    label={$t({ defaultMessage: 'Guest VLAN' })}
                    children={ethernetDataForDisplay?.unauthenticatedGuestVlan}
                  />
                }
              </>
            }
          </>
          }
        </>
        }
      </>
      }
      {wiredPortVisible && enableClientVisibility &&
      <>
        <Divider/>

        <Form.Item
          label={$t({ defaultMessage: 'SoftGRE Tunnel' })}
          children={
            (targetLanPort?.softGreProfileName && targetLanPort?.softGreProfileId) &&
              (<FormattedMessage
                defaultMessage={'{status} {leftQuote}<profileLink></profileLink>{rightQuote}'}
                values={{
                  status: transformDisplayOnOff(targetLanPort.softGreEnabled!),
                  leftQuote: targetLanPort?.ipsecProfileName ? '(' : '',
                  rightQuote: targetLanPort?.ipsecProfileName ? ')' : '',
                  profileLink: () => targetLanPort.softGreProfileId ?
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
            (targetLanPort?.ipsecProfileName && targetLanPort?.ipsecProfileId) &&
              (<FormattedMessage
                defaultMessage={'{status} {leftQuote}<profileLink></profileLink>{rightQuote}'}
                values={{
                  status: transformDisplayOnOff(targetLanPort.ipsecEnabled!),
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
          children={transformDisplayOnOff(!!targetLanPort?.clientIsolationEnabled)}
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
      title={title}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}

export default LanPortProfileDetailsDrawer