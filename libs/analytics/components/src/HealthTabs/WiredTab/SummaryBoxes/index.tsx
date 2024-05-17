import { useState } from 'react'

import { isNil }         from 'lodash'
import { defineMessage } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { AddMoreDetailsDrawer } from '../MoreDetails'

import { useWiredSummaryDataQuery } from './services'

export const SummaryBoxes = ({ filters }: { filters: AnalyticsFilter }) => {
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }

  const { data: summaryData, ...summaryQueryState } = useWiredSummaryDataQuery(payload)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [widget, setWidget] = useState<String>('')
  const moreDetails = (widget: String) => {
    setDrawerVisible(true)
    setWidget(widget)
  }

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      values: [{
        title: defineMessage({ defaultMessage: 'DHCP' }),
        value: !isNil(summaryData?.switchDHCP.successCount) &&
          summaryData?.switchDHCP.attemptCount
          ? formatter('percentFormat')(
            summaryData?.switchDHCP.successCount / summaryData?.switchDHCP.attemptCount)
          : noDataDisplay
      }],
      onClick: () => {moreDetails('dhcp')}
    },
    {
      type: 'red',
      values: [{
        title: defineMessage({ defaultMessage: 'Uplink usage' }),
        value: !isNil(summaryData?.congestedPortCount) &&
        summaryData?.portCount
          ? formatter('percentFormat')(summaryData?.congestedPortCount / summaryData?.portCount)
          : noDataDisplay
      }],
      onClick: () => {moreDetails('congestion')}
    },
    {
      type: 'yellow',
      values: [{
        title: defineMessage({ defaultMessage: 'Ports exp. Storm' }),
        value: !isNil(summaryData?.stormPortCount) &&
        summaryData?.portCount
          ? formatter('percentFormat')(summaryData?.stormPortCount / summaryData?.portCount)
          : noDataDisplay
      }],
      onClick: () => {moreDetails('portStorm')}
    },
    {
      type: 'grey',
      values: [{
        title: defineMessage({ defaultMessage: 'High CPU' }),
        value: !isNil(summaryData?.switchCpuUtilizationPct)
          ? formatter('percentFormat')(summaryData?.switchCpuUtilizationPct)
          : noDataDisplay
      }],
      onClick: () => {moreDetails('cpu')}
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
      {drawerVisible &&
      <AddMoreDetailsDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        widget={widget}
        setWidget={setWidget}
        payload={payload}
      />}
    </Loader>
  )
}
