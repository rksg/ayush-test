/* eslint-disable max-len */

import { useMemo } from 'react'

import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Drawer }                          from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetAAAPolicyViewModelListQuery,
  useGetEthernetPortProfileByIdQuery,
  useGetEthernetPortProfileTemplateQuery
} from '@acx-ui/rc/services'
import {
  AAAViewModalType,
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortCredentialTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface EthernetPortProfileDetailsDrawerProps {
  title: string
  visible: boolean
  setVisible: (visible: boolean) => void
  ethernetPortProfileData?: EthernetPortProfileViewData
}



const EthernetPortProfileDetailsDrawer = (props: EthernetPortProfileDetailsDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { title, visible, setVisible, ethernetPortProfileData } = props
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableClientVisibility = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const onClose = () => {
    setVisible(false)
  }

  // eslint-disable-next-line max-len
  const { radiusNameMap = [] } = useGetAAAPolicyViewModelListQuery({
    params: { tenantId: params.tenantId },
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
    extraParams: { id: ethernetPortProfileData?.id },
    skip: !ethernetPortProfileData?.id
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
        label={$t({ defaultMessage: 'Name' })}
        children={ethernetDataForDisplay?.name}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Port type' })}
        children={getEthernetPortTypeString(ethernetDataForDisplay?.type)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Untag ID' })}
        children={ethernetDataForDisplay?.untagId}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Member' })}
        children={ethernetDataForDisplay?.vlanMembers}
      />

      <Form.Item
        label={$t({ defaultMessage: '802.1X' })}
        children={
          (ethernetDataForDisplay?.authType === EthernetPortAuthType.DISABLED)?
            'Off': 'On'
        }
      />
      {enableClientVisibility &&
        <Form.Item
          label={$t({ defaultMessage: 'Client Visibility' })}
          children={
            (ethernetDataForDisplay?.authType === EthernetPortAuthType.OPEN ||
            ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED ||
            ethernetDataForDisplay?.authType === EthernetPortAuthType.PORT_BASED)?
              'On' : 'Off'
          }
        />
      }
      {!(ethernetDataForDisplay?.authType === EthernetPortAuthType.DISABLED) &&
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
            label={$t({ defaultMessage: 'Proxy Service(Auth)' })}
            children={(ethernetDataForDisplay?.enableAuthProxy)? 'On' : 'Off'}
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
            label={$t({ defaultMessage: 'Proxy Service(Accounting)' })}
            children={(ethernetDataForDisplay?.enableAuthProxy)? 'On' : 'Off'}
          />

          {ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Auth Bypass' })}
              children={(ethernetDataForDisplay?.bypassMacAddressAuthentication)? 'On' : 'Off'}
            />

            {ethernetDataForDisplay?.authType === EthernetPortAuthType.MAC_BASED &&
              <>
                <Form.Item
                  label={$t({ defaultMessage: 'Dynamic VLAN' })}
                  children={(ethernetDataForDisplay?.dynamicVlanEnabled)? 'On' : 'Off'}
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

export default EthernetPortProfileDetailsDrawer