/* eslint-disable max-len */
import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Drawer }                            from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { useGetAAAPolicyViewModelListQuery } from '@acx-ui/rc/services'
import {
  AAAViewModalType,
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  KeyValue, PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortCredentialTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

// import * as UI from './styledComponents'

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
  const emptyResult: KeyValue<string, string>[] = []
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  // const { data: userProfile } = useUserProfileContext()

  const onClose = () => {
    setVisible(false)
  }

  // eslint-disable-next-line max-len
  const { radiusNameMap }: { radiusNameMap: KeyValue<string, string>[] } = useGetAAAPolicyViewModelListQuery({
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
      radiusNameMap: data?.data
        ? data.data.map(radius => ({ key: radius.id!, value: radius.name }))
        : emptyResult
    })
  })

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
      // style={{ marginTop: currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
    >
      <Form.Item
        label={$t({ defaultMessage: 'Name' })}
        children={ethernetPortProfileData?.name}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Port type' })}
        children={getEthernetPortTypeString(ethernetPortProfileData?.type)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Untag ID' })}
        children={ethernetPortProfileData?.untagId}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Member' })}
        children={ethernetPortProfileData?.vlanMembers}
      />

      <Form.Item
        label={$t({ defaultMessage: '802.1X' })}
        children={
          (ethernetPortProfileData?.authType === EthernetPortAuthType.DISABLED)?
            'Off': 'On'
        }
      />
      {!(ethernetPortProfileData?.authType === EthernetPortAuthType.DISABLED) &&
      <>
        <Divider/>

        <Form.Item
          label={$t({ defaultMessage: '802.1X Role' })}
          children={getEthernetPortAuthTypeString(ethernetPortProfileData?.authType)}
        />

        {ethernetPortProfileData?.authType === EthernetPortAuthType.SUPPLICANT &&
        <Form.Item
          label={$t({ defaultMessage: 'Credential Type' })}
          children={getEthernetPortCredentialTypeString(ethernetPortProfileData?.supplicantAuthenticationOption)}
        />
        }
        {!(ethernetPortProfileData?.authType === EthernetPortAuthType.SUPPLICANT) &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'Authentication Service' })}
            children={
              (!ethernetPortProfileData?.authRadiusId)
                ? ''
                : (
                  <TenantLink to={getPolicyDetailsLink({
                    type: PolicyType.AAA,
                    oper: PolicyOperation.DETAIL,
                    policyId: ethernetPortProfileData.authRadiusId })}>
                    {radiusNameMap.find(radius => radius.key === ethernetPortProfileData?.authRadiusId)?.value || ''}
                  </TenantLink>)
            }
          />

          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service(Auth)' })}
            children={(ethernetPortProfileData?.enableAuthProxy)? 'No' : 'Off'}
          />

          <Form.Item
            label={$t({ defaultMessage: 'Accounting Service' })}
            children={
              (!ethernetPortProfileData?.accountingRadiusId)
                ? '-'
                : (
                  <TenantLink to={getPolicyDetailsLink({
                    type: PolicyType.AAA,
                    oper: PolicyOperation.DETAIL,
                    policyId: ethernetPortProfileData.accountingRadiusId })}>
                    {radiusNameMap.find(radius => radius.key === ethernetPortProfileData?.accountingRadiusId)?.value || ''}
                  </TenantLink>)
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service(Accounting)' })}
            children={(ethernetPortProfileData?.enableAuthProxy)? 'No' : 'Off'}
          />

          {ethernetPortProfileData?.authType === EthernetPortAuthType.MAC_BASED &&
          <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Auth Bypass' })}
              children={(ethernetPortProfileData?.bypassMacAddressAuthentication)? 'No' : 'Off'}
            />

            {ethernetPortProfileData?.authType === EthernetPortAuthType.MAC_BASED &&
              <>
                <Form.Item
                  label={$t({ defaultMessage: 'Dynamic VLAN' })}
                  children={(ethernetPortProfileData?.dynamicVlanEnabled)? 'No' : 'Off'}
                />
                { ethernetPortProfileData?.dynamicVlanEnabled &&
                  <Form.Item
                    label={$t({ defaultMessage: 'Guest VLAN' })}
                    children={ethernetPortProfileData?.unauthenticatedguestVlan}
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
