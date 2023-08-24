import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard } from '@acx-ui/components'
import { useGetTunnelProfileViewDataListQuery }          from '@acx-ui/rc/services'
import {
  MtuTypeEnum,
  PolicyOperation,
  PolicyType,
  TunnelProfileViewData,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { NetworkTable } from './Networktable'
import * as UI          from './styledComponents'

const TunnelProfileDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })

  const getTunnelProfilePayload = {
    filters: { id: [params.policyId] }
  }
  const { tunnelProfileData, isLoading } = useGetTunnelProfileViewDataListQuery(
    { payload: getTunnelProfilePayload },
    {
      selectFromResult: ({ data, isLoading }) => ({
        tunnelProfileData: data?.data?.[0] || {} as TunnelProfileViewData,
        isLoading
      })
    }
  )

  const isDefaultTunnelProfile = tunnelProfileData.id === params.tenantId

  const tunnelInfo = [
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   content: () => (tunnelProfileData.tags)
    // },
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      content: () => (
        MtuTypeEnum.AUTO === tunnelProfileData.mtuType ?
          $t({ defaultMessage: 'Auto' }) :
          `${$t({ defaultMessage: 'Manual' })} (${tunnelProfileData.mtuSize})`
      )
    },
    {
      title: $t({ defaultMessage: 'Force Fragmentation' }),
      content: () => (
        tunnelProfileData.forceFragmentation ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' })
      )
    }
  ]

  return (
    <>
      <PageHeader
        title={tunnelProfileData.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Tunnel Profile' }),
            link: tablePath
          }
        ]}
        extra={
          filterByAccess([
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId as string
            })}>
              <Button key={'configure'} type={'primary'} disabled={isDefaultTunnelProfile}>
                {$t({ defaultMessage: 'Configure' })}
              </Button></TenantLink>
          ])
        }
      />
      <Loader states={[
        {
          isFetching: isLoading,
          isLoading: false
        }
      ]}>
        <Space direction='vertical' size={30}>
          <SummaryCard data={tunnelInfo} colPerRow={6} />
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t(
                  { defaultMessage: 'Instances ({count})' },
                  { count: tunnelProfileData.networkIds?.length || 0 }
                )}
              </Typography.Title>
            </UI.InstancesMargin>
            <NetworkTable networkIds={tunnelProfileData.networkIds || []} />
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default TunnelProfileDetail
