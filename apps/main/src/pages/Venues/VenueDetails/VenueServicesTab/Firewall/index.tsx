import { useState } from 'react'

import { Select, Space, Typography } from 'antd'
import moment                        from 'moment'
import { useIntl }                   from 'react-intl'
import styled                        from 'styled-components/macro'

import { Card, GridCol, GridRow, Loader, RangePicker, Tabs } from '@acx-ui/components'
import { useGetEdgeFirewallQuery, useGetEdgeListQuery }      from '@acx-ui/rc/services'
import {
  ACLDirection,
  getACLDirectionOptions,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'
import { useDateFilter }         from '@acx-ui/utils'

import { DDoSRulesTable }        from './DDoSRulesTable'
import { StatefulACLRulesTable } from './StatefulACLRulesTable'
import * as UI                   from './styledComponents'

const EdgeFirewall = styled(({ className }: { className?: string }) => {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const [aclDirection, setACLDirection] = useState(ACLDirection.INBOUND)
  const directionOpts = getACLDirectionOptions($t)

  // 1. get edge by venueId, use 'firewallId' in edge data
  const edgeDataPayload = {
    fields: [
      'name',
      'serialNumber',
      'firewallId'
    ],
    filter: { venueId: [venueId] }
  }
  const { edgeData, isEdgeLoading } = useGetEdgeListQuery(
    { payload: edgeDataPayload },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isLoading }) => ({
        edgeData: data?.data[0],
        isEdgeLoading: isLoading
      })
    }
  )

  const serviceId = edgeData?.firewallId

  // 2. get firewall by firewallId
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

  const handleACLDirectionChange = (val:ACLDirection) => {
    setACLDirection(val)
  }

  return (<Loader states={[
    {
      isFetching: false,
      isLoading: isEdgeLoading || isFWInfoLoading
    }
  ]}>
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
      <Tabs type='third'>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'DDoS' })}
          key='ddos'
        >
          <UI.ActionsContainer>
            {filterByAccess([
              <RangePicker
                key='date-filter'
                selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
                onDateApply={setDateFilter as CallableFunction}
                showTimePicker
                selectionType={range}
              />])
            }
          </UI.ActionsContainer>
          <DDoSRulesTable firewallData={edgeFirewallData} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Stateful ACL' })}
          key='acl'
        >
          <UI.ActionsContainer>
            <Select
              value={aclDirection}
              onChange={handleACLDirectionChange}
            >
              {directionOpts.map(({ label, value }) =>
                (<Select.Option value={value} key={value} children={label} />)
              )}
            </Select>
          </UI.ActionsContainer>
          <StatefulACLRulesTable firewallData={edgeFirewallData} direction={aclDirection} />
        </Tabs.TabPane>
      </Tabs>
    </Space>
  </Loader>)
})`${UI.WrapperStyle}`

export default EdgeFirewall