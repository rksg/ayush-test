import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, SummaryCard }            from '@acx-ui/components'
import { EdgeFirewallGroupedStatsTables } from '@acx-ui/rc/components'
import { useGetEdgeFirewallQuery }        from '@acx-ui/rc/services'
import {
  ACLDirection,
  EdgeStatus,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


interface EdgeFirewallServiceProps {
  className?: string;
  edgeData: EdgeStatus;
}

const EdgeFirewall = ({ className, edgeData }: EdgeFirewallServiceProps) => {
  const { $t } = useIntl()
  const serviceId = edgeData.firewallId

  // get firewall by firewallId
  const {
    data: edgeFirewallData,
    isLoading: isFWInfoLoading
  } = useGetEdgeFirewallQuery({ params: { serviceId } },
    { skip: !!!serviceId })

  const infoFields = edgeFirewallData ? [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: () => <TenantLink to={getServiceDetailsLink({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId!
      })}>
        {edgeFirewallData.serviceName}
      </TenantLink>
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      // TODO: query statistic data and aggregate with rules.
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'DDoS Rate-limiting' }),
      content: () => (
        edgeFirewallData.ddosRateLimitingEnabled ? $t(
          { defaultMessage:
            'ON ({rulesCount} {rulesCount, plural, one {rule} other {rules}})' },
          {
            rulesCount: Object.keys(edgeFirewallData?.ddosRateLimitingRules || []).length
          }
        )
          : $t({ defaultMessage: 'OFF' })
      )
    },
    {
      title: $t({ defaultMessage: 'Stateful ACL' }),
      content: () => (
        edgeFirewallData.statefulAclEnabled
          ? $t(
            { defaultMessage: `ON (IN: {inCount} {inCount, plural, one {rule} other {rules}},
             OUT: {outCount} {outCount, plural, one {rule} other {rules}})` },
            {
              inCount: edgeFirewallData.statefulAcls.filter(item =>
                item.direction === ACLDirection.INBOUND
              )[0].rules.length,
              outCount: edgeFirewallData.statefulAcls.filter(item =>
                item.direction === ACLDirection.OUTBOUND
              )[0].rules.length
            }
          )
          : $t({ defaultMessage: 'OFF' })
      )
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: (
        <TenantLink to={`/devices/edge/${edgeData?.serialNumber}/details/overview`}>
          {edgeData?.name}
        </TenantLink>
      )
    }
  ] : []

  return (<Loader states={[{
    isFetching: false,
    isLoading: isFWInfoLoading
  }]}>
    <Space direction='vertical' size={30} className={className}>
      <SummaryCard data={infoFields} />
      <EdgeFirewallGroupedStatsTables
        edgeData={edgeData}
        edgeFirewallData={edgeFirewallData!}
      />
    </Space>
  </Loader>)
}

export default EdgeFirewall
