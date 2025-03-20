import { Space,  Typography } from 'antd'
import { useIntl }            from 'react-intl'

import {
  Button,
  PageHeader,
  SummaryCard,
  Card,
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useGetEthernetPortProfileTemplateQuery,
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
  getScopeKeyByPolicy,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplate,
  usePolicyListBreadcrumb,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import { ApTable }    from './InstanceTable/ApTable'
import { VenueTable } from './InstanceTable/VenueTable'

export const EthernetPortProfileDetail = () => {

  const { $t } = useIntl()
  const { policyId } = useParams()
  const { isTemplate } = useConfigTemplate()

  const supportDynamicVLAN = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ETHERNET_PORT_PROFILE)

  const { data: ethernetPortProfileData } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEthernetPortProfileWithRelationsByIdQuery,
    useTemplateQueryFn: useGetEthernetPortProfileTemplateQuery,
    enableRbac: true,
    extraParams: { id: policyId },
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policyId]
      }
    }
  })

  const { data: authRadiusData } = useAaaPolicyQuery(
    {
      params: { policyId: ethernetPortProfileData?.authRadiusId }
    }, {
      skip: !!!ethernetPortProfileData?.authRadiusId || isTemplate
    }
  )

  const { data: acctRadiusData } = useAaaPolicyQuery(
    {
      params: { policyId: ethernetPortProfileData?.accountingRadiusId }
    }, {
      skip: !!!ethernetPortProfileData?.accountingRadiusId || isTemplate
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
    },
    ...(isTemplate? [] : [{
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
    }]),
    ...(supportDynamicVLAN && !isTemplate &&
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
      breadcrumb={breadcrumb}
      extra={filterByAccessForServicePolicyMutation([
        <PolicyConfigTemplateLinkSwitcher
          // eslint-disable-next-line max-len
          rbacOpsIds={useTemplateAwarePolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.EDIT)}
          scopeKey={getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.EDIT)}
          type={PolicyType.ETHERNET_PORT_PROFILE}
          oper={PolicyOperation.EDIT}
          policyId={policyId!}
          children={
            <Button key={'configure'} type={'primary'} disabled={isDefaultProfile}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          }
        />
      ])}
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