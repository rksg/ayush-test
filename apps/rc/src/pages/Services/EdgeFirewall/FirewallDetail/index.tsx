import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard } from '@acx-ui/components'
import { EdgeServiceStatusLight }                        from '@acx-ui/rc/components'
import { useGetEdgeFirewallViewDataListQuery }           from '@acx-ui/rc/services'
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

  const firewallInfo = [
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => ((edgeFirewallData.edgeIds?.length ?? 0)
        ? <EdgeServiceStatusLight data={edgeFirewallData.edgeAlarmSummary} />
        : $t({ defaultMessage: '--' })
      )
    },
    {
      title: $t({ defaultMessage: 'DDoS Rate-limiting' }),
      content: () => (edgeFirewallData.ddosEnabled
        ? $t(
          { defaultMessage: 'ON ({rulesCount} rules)' },
          {
            rulesCount: Object.keys(edgeFirewallData?.ddosRateLimitingRules || []).length
          }
        )
        : $t({ defaultMessage: 'OFF' })
      )
    },
    {
      title: $t({ defaultMessage: 'Stateful ACL' }),
      content: () => (edgeFirewallData.statefulAclEnabled
        ? $t(
          { defaultMessage: 'ON (IN: {inCount} rules, OUT: {outCount} rules)' },
          {
            inCount: edgeFirewallData.statefulAcls?.filter(item =>
              item.aclDirection === ACLDirection.INBOUND
            )[0]?.aclRuleNum || 0,
            outCount: edgeFirewallData.statefulAcls?.filter(item =>
              item.aclDirection === ACLDirection.OUTBOUND
            )[0]?.aclRuleNum || 0
          }
        )
        : $t({ defaultMessage: 'OFF' })
      )
    }
  ]

  return (
    <>
      <PageHeader
        title={edgeFirewallData.firewallName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
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
          <SummaryCard data={firewallInfo} />
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t(
                  { defaultMessage: 'Instances ({count})' },
                  { count: edgeFirewallData.edgeIds?.length || 0 }
                )}
              </Typography.Title>
            </UI.InstancesMargin>
            <EdgeTable
              edgeIds={edgeFirewallData.edgeIds || []}
              edgeAlarmSummary={edgeFirewallData.edgeAlarmSummary || []}
            />
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default FirewallDetail
