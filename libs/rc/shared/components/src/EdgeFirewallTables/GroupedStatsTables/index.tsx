import { useState } from 'react'

import { Empty, Select } from 'antd'
import _                 from 'lodash'
import moment            from 'moment'
import { useIntl }       from 'react-intl'
import styled            from 'styled-components/macro'

import { DateRangeType, RangePicker, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }           from '@acx-ui/feature-toggle'
import {
  ACLDirection,
  EdgeFirewallSetting,
  EdgeStatus,
  getACLDirectionOptions } from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import { DDoSRulesTable as DDoSRulesConfigTable }               from '../DDoSRulesTable'
import { StatefulACLRulesTable as StatefulACLRulesConfigTable } from '../StatefulACLRulesTable'

import { DDoSRulesTable }        from './DDoSRulesTable'
import { StatefulACLRulesTable } from './StatefulACLRulesTable'
import * as UI                   from './styledComponents'

interface GroupedStatsTablesProps {
  className?: string;
  edgeData: EdgeStatus;
  edgeFirewallData: EdgeFirewallSetting;
}

export const GroupedStatsTables =
  styled((props: GroupedStatsTablesProps) => {
    const { $t } = useIntl()
    const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
    const { className, edgeData, edgeFirewallData } = props
    const { startDate, endDate, range, setDateFilter } = useDateFilter()
    const [aclDirection, setACLDirection] = useState(ACLDirection.INBOUND)
    const directionOpts = getACLDirectionOptions($t)

    const handleACLDirectionChange = (val:ACLDirection) => {
      setACLDirection(val)
    }

    const filterPeriod:DateRangeType = {
      startDate: moment(startDate),
      endDate: moment(endDate)
    }

    return <Tabs type='third' className={className}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'DDoS' })}
        key='ddos'
      >
        <UI.ActionsContainer>
          {filterByAccess([
            <RangePicker
              key='SHOW_WITHOUT_RBAC_CHECK'
              selectedRange={filterPeriod}
              selectionType={range}
              onDateApply={setDateFilter as CallableFunction}
              showTimePicker
            />])
          }
        </UI.ActionsContainer>
        {isEdgeReady
          ? <DDoSRulesTable
            firewallData={edgeFirewallData}
            dateFilter={{
              startDate,
              endDate
            }}
            edgeId={edgeData.serialNumber}
            venueId={edgeData.venueId}
          />
          : <DDoSRulesConfigTable
            dataSource={edgeFirewallData.ddosRateLimitingRules}
            locale={{
              emptyText: <Empty description={$t({ defaultMessage: 'No data' })} />
            }}
          />
        }
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
          {filterByAccess([
            <RangePicker
              key='SHOW_WITHOUT_RBAC_CHECK'
              selectedRange={filterPeriod}
              selectionType={range}
              onDateApply={setDateFilter as CallableFunction}
              showTimePicker
            />])
          }
        </UI.ActionsContainer>
        {isEdgeReady
          ? <StatefulACLRulesTable
            firewallData={edgeFirewallData}
            direction={aclDirection}
            dateFilter={{
              startDate,
              endDate
            }}
            edgeId={edgeData.serialNumber}
            venueId={edgeData.venueId}
          />
          : <StatefulACLRulesConfigTable
            dataSource={_.find(edgeFirewallData.statefulAcls,
              { direction: aclDirection })?.rules}
            locale={{
              emptyText: <Empty description={$t({ defaultMessage: 'No data' })} />
            }}
          />}
      </Tabs.TabPane>
    </Tabs>
  })`${UI.WrapperStyle}`