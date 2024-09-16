import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, PageHeader, SummaryCard, Card }                         from '@acx-ui/components'
import { useAaaPolicyQuery, useGetEthernetPortProfileViewDataListQuery } from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  getPolicyListRoutePath } from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { WifiScopes }            from '@acx-ui/types'
import { filterByAccess }        from '@acx-ui/user'

import { EthernetPortProfileInstanceTable } from './EthernetPortProfileInstanceTable'

export const EthernetPortProfileDetail = () => {

  const { $t } = useIntl()
  const { policyId } = useParams()
  const { ethernetPortProfileData } = useGetEthernetPortProfileViewDataListQuery({
    payload: {
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        id: [policyId]
      }
    }
  }, {
    selectFromResult: ({ data: queryResult })=>{
      return {
        ethernetPortProfileData: queryResult?.data[0]
      }
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
    }
  ]

  return (<>
    <PageHeader
      title={ethernetPortProfileData?.name}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }
      ]}
      extra={
        filterByAccess([
          <TenantLink
            scopeKey={[WifiScopes.UPDATE]}
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
          {$t(
            { defaultMessage: 'Instances ({count})' },
            { count: 0 }
          )}
        </Typography.Title>
        <EthernetPortProfileInstanceTable
          apSerialNumbers={ethernetPortProfileData?.apSerialNumbers || []}
        />
      </Card>
    </Space>
  </>)
}