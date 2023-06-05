import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'
import { EdgeFirewallGroupedStatsTables } from '@acx-ui/rc/components'
import { useGetEdgeFirewallQuery }        from '@acx-ui/rc/services'
import {
  ACLDirection,
  EdgeStatus,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

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
        $t(
          { defaultMessage:
            '{status} ({rulesCount} {rulesCount, plural, one {rule} other {rules}})' },
          {
            status: edgeFirewallData.ddosRateLimitingEnabled ?
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
          { defaultMessage: `{status} (IN: {inCount} {inCount, plural, one {rule} other {rules}},
             OUT: {outCount} {outCount, plural, one {rule} other {rules}})` },
          {
            status: edgeFirewallData.statefulAclEnabled ?
              $t({ defaultMessage: 'ON' }):
              $t({ defaultMessage: 'OFF' }),
            inCount: edgeFirewallData.statefulAcls.filter(item =>
              item.direction === ACLDirection.INBOUND
            )[0].rules.length,
            outCount: edgeFirewallData.statefulAcls.filter(item =>
              item.direction === ACLDirection.OUTBOUND
            )[0].rules.length
          }
        )
      )
    }
  ] : []

  return (<Loader states={[{
    isFetching: false,
    isLoading: isFWInfoLoading
  }]}>
    <Space direction='vertical' size={30} className={className}>
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
      <EdgeFirewallGroupedStatsTables
        edgeData={edgeData}
        edgeFirewallData={edgeFirewallData!}
      />
    </Space>
  </Loader>)
}

export default EdgeFirewall