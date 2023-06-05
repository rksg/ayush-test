import { useState } from 'react'

import { Select }  from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { DateRangeType, RangePicker, Tabs } from '@acx-ui/components'
import {
  ACLDirection,
  EdgeFirewallSetting,
  EdgeStatus,
  getACLDirectionOptions } from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import { DDoSRulesTable }        from './DDoSRulesTable'
import { StatefulACLRulesTable } from './StatefulACLRulesTable'
import * as UI                   from './styledComponents'

interface GroupedStatsTablesProps {
  className?: string;
  edgeData: EdgeStatus;
  edgeFirewallData: EdgeFirewallSetting;
  displayACLOtherInfo?: boolean;
}

export const GroupedStatsTables =
  styled((props: GroupedStatsTablesProps) => {
    const { $t } = useIntl()
    const { className, edgeData, edgeFirewallData, displayACLOtherInfo } = props
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
              key='date-filter'
              selectedRange={filterPeriod}
              selectionType={range}
              onDateApply={setDateFilter as CallableFunction}
              showTimePicker
            />])
          }
        </UI.ActionsContainer>
        <DDoSRulesTable
          firewallData={edgeFirewallData}
          dateFilter={{
            startDate,
            endDate
          }}
          edgeId={edgeData.serialNumber}
          venueId={edgeData.venueId}
        />
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
              key='date-filter'
              selectedRange={filterPeriod}
              selectionType={range}
              onDateApply={setDateFilter as CallableFunction}
              showTimePicker
            />])
          }
        </UI.ActionsContainer>
        <StatefulACLRulesTable
          firewallData={edgeFirewallData}
          direction={aclDirection}
          dateFilter={{
            startDate,
            endDate
          }}
          edgeId={edgeData.serialNumber}
          venueId={edgeData.venueId}
          displayOtherInfo={displayACLOtherInfo}
        />
      </Tabs.TabPane>
    </Tabs>
  })`${UI.WrapperStyle}`