import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader }                                                                                from '@acx-ui/components'
import { useGetTunnelProfileViewDataListQuery }                                                                                              from '@acx-ui/rc/services'
import { getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath, MtuTypeEnum, PolicyOperation, PolicyType, TunnelProfileViewData } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                             from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                                    from '@acx-ui/user'

import { NetworkTable } from './Networktable'
import * as UI          from './styledComponents'

const TunnelProfileDetail = () => {

  const { $t } = useIntl()
  const params = useParams()

  const getTunnelProfilePayload = {
    filters: { id: [params.poliicyId] }
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

  const infoFields = [
    {
      title: $t({ defaultMessage: 'Tags' }),
      content: () => (tunnelProfileData.tags)
    },
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
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Tunnel Profile' }),
            link: getPolicyRoutePath({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.LIST
            })
          }
        ]}
        extra={
          filterByAccess([
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId as string
            })}>
              <Button key={'configure'} type={'primary'}>
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
          <Card type='solid-bg'>
            <UI.InfoMargin>
              <GridRow>
                {infoFields.map(item =>
                  (<GridCol col={{ span: 3 }} key={item.title}>
                    <Space direction='vertical' size={10}>
                      <Typography.Text>
                        {item.title}
                      </Typography.Text>
                      <Typography.Text>
                        {item.content()}
                      </Typography.Text>
                    </Space>
                  </GridCol>)
                )}
              </GridRow>
            </UI.InfoMargin>
          </Card>
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances' })}
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