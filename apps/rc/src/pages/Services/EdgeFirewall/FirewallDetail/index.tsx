import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'
import { useGetEdgeFirewallViewDataListQuery }                from '@acx-ui/rc/services'
import {
  ACLDirection,
  EdgeFirewallViewData,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { EdgeTable } from './EdgeTable'
import * as UI       from './styledComponents'

const FirewallDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const getEdgeFirewallPayload = {
    filters: { id: [params.serviceId] }
  }
  const { edgeFirewallData, isLoading } = useGetEdgeFirewallViewDataListQuery(
    { payload: getEdgeFirewallPayload },
    {
      selectFromResult: ({ data, isLoading }) => ({
        edgeFirewallData: data?.data?.[0] || {} as EdgeFirewallViewData,
        isLoading
      })
    }
  )

  const infoFields = [
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'DDoS Rate-limiting' }),
      content: () => (
        $t(
          { defaultMessage: '{status} ({rulesCount} rules)' },
          {
            status: edgeFirewallData.ddosEnabled ?
              $t({ defaultMessage: 'ON' }):
              $t({ defaultMessage: 'OFF' }),
            rulesCount: Object.keys(edgeFirewallData?.ddosRateLimitingRules || []).length
          }
        )
      )
    },
    {
      title: $t({ defaultMessage: 'Stateful ACL' }),
      content: () => (
        $t(
          { defaultMessage: '{status} (IN: {inCount} rules, OUT: {outCount} rules)' },
          {
            status: edgeFirewallData.statefulAclEnabled ?
              $t({ defaultMessage: 'ON' }):
              $t({ defaultMessage: 'OFF' }),
            inCount: edgeFirewallData.statefulAcls?.filter(item =>
              item.aclDirection === ACLDirection.INBOUND
            )[0]?.aclRuleNum || 0,
            outCount: edgeFirewallData.statefulAcls?.filter(item =>
              item.aclDirection === ACLDirection.OUTBOUND
            )[0]?.aclRuleNum || 0
          }
        )
      )
    }
  ]

  return (
    <>
      <PageHeader
        title={edgeFirewallData.firewallName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Firewall' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_FIREWALL,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.EDGE_FIREWALL,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
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
                {$t(
                  { defaultMessage: 'Instances ({count})' },
                  { count: edgeFirewallData.edgeIds?.length || 0 }
                )}
              </Typography.Title>
            </UI.InstancesMargin>
            <EdgeTable edgeIds={edgeFirewallData.edgeIds || ['']} />
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default FirewallDetail