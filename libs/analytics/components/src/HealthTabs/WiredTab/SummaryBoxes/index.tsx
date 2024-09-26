import { useState } from 'react'

import { isNil }         from 'lodash'
import { defineMessage } from 'react-intl'

import { limitRange }                                          from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { MoreDetailsDrawer } from '../MoreDetails'
import { WidgetType }        from '../MoreDetails/config'

import { useWiredSummaryDataQuery } from './services'

export const SummaryBoxes = ( props: { filters: AnalyticsFilter, noSwitches?: boolean }) => {
  const { filters, noSwitches = false } = props
  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate,
    isSwitchHealth10010eEnabled
  }
  const { data: summaryData, ...summaryQueryState } = useWiredSummaryDataQuery(payload)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [widget, setWidget] = useState<WidgetType | null>(null)

  const moreDetails = (widget: WidgetType) => {
    setDrawerVisible(true)
    setWidget(widget)
  }

  function formatValue ( numerator: number | undefined, denominator: number | undefined,
    noData: boolean): string {
    if (noData) return noDataDisplay
    return formatter('percentFormat')(
      numerator && denominator ? limitRange(numerator / denominator) : 0
    )
  }

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      values: [{
        title: defineMessage({ defaultMessage: 'DHCP Success' }),
        value: formatValue(
          summaryData?.switchDHCP.successCount,
          summaryData?.switchDHCP.attemptCount,
          noSwitches )
      }],
      onClick: () => { moreDetails('dhcpFailure') }
    },
    {
      type: 'red',
      values: [{
        title: defineMessage({ defaultMessage: 'Congested Uplink Ports' }),
        value: formatValue(
          summaryData?.congestedPortCount,
          summaryData?.uplinkPortCount,
          noSwitches)
      }],
      onClick: () => { moreDetails('congestion') }
    },
    {
      type: 'yellow',
      values: [{
        title: defineMessage({ defaultMessage: 'Multicast Storm Ports' }),
        value: formatValue(
          summaryData?.stormPortCount,
          isSwitchHealth10010eEnabled? summaryData?.nonStackPortCount: summaryData?.portCount,
          noSwitches)
      }],
      onClick: () => { moreDetails('portStorm') }
    },
    {
      type: 'grey',
      values: [{
        title: defineMessage({ defaultMessage: 'High CPU' }),
        value: !isNil(summaryData?.switchCpuUtilizationPct)
          ? formatter('percentFormat')(limitRange(summaryData?.switchCpuUtilizationPct!))
          : noDataDisplay
      }],
      onClick: () => { moreDetails('cpuUsage') }
    }
  ]

  return (
    <Loader states={[summaryQueryState]}>
      <GridRow>
        {mapping.map((stat) =>
          <GridCol key={stat.type} col={{ span: 24 / mapping.length }}>
            <StatsCard {...stat} />
          </GridCol>
        )}
      </GridRow>
      {
        drawerVisible &&
        <MoreDetailsDrawer
          visible={drawerVisible}
          setVisible={setDrawerVisible}
          widget={widget!}
          setWidget={setWidget}
          filters={filters}
        />
      }
    </Loader>
  )
}
