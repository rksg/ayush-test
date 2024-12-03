import { Space,  Typography } from 'antd'
import { useIntl }            from 'react-intl'

import {
  Button,
  PageHeader,
  SummaryCard,
  Card,
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }                   from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useGetEthernetPortProfileWithRelationsByIdQuery
} from '@acx-ui/rc/services'
import {
  EthernetPortAuthType,
  PolicyOperation,
  PolicyType,
  filterByAccessForServicePolicyMutation,
  getEthernetPortAuthTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { ApTable }    from './InstanceTable/ApTable'
import { VenueTable } from './InstanceTable/VenueTable'

export const EthernetPortProfileDetail = () => {

  const { $t } = useIntl()
  const { policyId } = useParams()
  const supportDynamicVLAN = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE)
  const { data: ethernetPortProfileData } = useGetEthernetPortProfileWithRelationsByIdQuery({
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policyId]
      }
    },
    params: {
      id: policyId
    }
  })

  const { data: authRadiusData } = useAaaPolicyQuery(
    {
      params: { policyId: ethernetPortProfileData?.authRadiusId }
    }, {
      skip: !!!ethernetPortProfileData?.authRadiusId
    }
  )

  const { data: acctRadiusData } = useAaaPolicyQuery(
    {
      params: { policyId: ethernetPortProfileData?.accountingRadiusId }
    }, {
      skip: !!!ethernetPortProfileData?.accountingRadiusId
    }
  )

  const isDefaultProfile = ethernetPortProfileData?.isDefault || false

  const ethernetPortProfileInfo =[
    {
      title: $t({ defaultMessage: 'Port Type' }),
      content: () => {
        return getEthernetPortTypeString(ethernetPortProfileData?.type)
      }
    }, {
      title: $t({ defaultMessage: 'VLAN Untag' }),
      content: () => {
        return ethernetPortProfileData?.untagId
      }
    }, {
      title: $t({ defaultMessage: 'VLAN Members' }),
      content: () => {
        return ethernetPortProfileData?.vlanMembers
      }
    }, {
      title: $t({ defaultMessage: '802.1X Authentication' }),
      content: () => {
        const authTypeString = getEthernetPortAuthTypeString(ethernetPortProfileData?.authType)
        return (authTypeString)? 'On (' + authTypeString + ')' : 'Off'
      }
    }, {
      title: $t({ defaultMessage: 'Authentication Service' }),
      content: (
        (!authRadiusData) ?
          '-' : (
            <TenantLink
              to={
                getPolicyDetailsLink({
                  type: PolicyType.AAA,
                  oper: PolicyOperation.DETAIL,
                  policyId: authRadiusData.id as string
                })
              }>
              {authRadiusData?.name}
            </TenantLink>
          ))
    }, {
      title: $t({ defaultMessage: 'Accounting Service' }),
      content: (
        (!acctRadiusData) ?
          '-' : (
            <TenantLink
              to={
                getPolicyDetailsLink({
                  type: PolicyType.AAA,
                  oper: PolicyOperation.DETAIL,
                  policyId: acctRadiusData.id as string
                })
              }>
              {acctRadiusData.name}
            </TenantLink>
          ))
    }, {
      title: $t({ defaultMessage: 'MAC Auth Bypass' }),
      content: () => {
        return (ethernetPortProfileData?.bypassMacAddressAuthentication)? 'On' : 'Off'
      }
    },
    ...(supportDynamicVLAN &&
      ethernetPortProfileData?.authType === EthernetPortAuthType.MAC_BASED ?
      [{
        title: $t({ defaultMessage: 'Dynamic VLAN' }),
        content: () => {
          return (ethernetPortProfileData?.dynamicVlanEnabled)? 'On' : 'Off'
        }
      }] : [])
  ]

  return (<>
    <PageHeader
      title={ethernetPortProfileData?.name}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        },{
          text: $t({ defaultMessage: 'Ethernet Port Profiles' }),
          link: getPolicyRoutePath(
            { type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.LIST }
          )
        }
      ]}
      extra={
        filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.EDIT)}
            to={getPolicyDetailsLink({
              type: PolicyType.ETHERNET_PORT_PROFILE,
              oper: PolicyOperation.EDIT,
              policyId: policyId as string
            })}>
            <Button key={'configure'} type={'primary'} disabled={isDefaultProfile}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])
      }

    />
    <Space direction='vertical' size={30}>
      <SummaryCard data={ethernetPortProfileInfo} colPerRow={6} />
      <Card>
        <Typography.Title level={2}>
          {$t({ defaultMessage: 'Instances' })}
        </Typography.Title>
        <Tabs
          type='third'
          // onChange={onTabChange}
          animated={true}
        >
          <Tabs.TabPane
            tab={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            key={'venue'}
            forceRender={true}
          >
            <VenueTable
              venueActivations={ethernetPortProfileData?.venueActivations || []}
            />

          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'AP' })}
            key={'ap'}
            forceRender={true}
          >
            <ApTable
              apSerialNumbers={ethernetPortProfileData?.apSerialNumbers || []}
            />
          </Tabs.TabPane>
        </Tabs>

      </Card>
    </Space>
  </>)
}