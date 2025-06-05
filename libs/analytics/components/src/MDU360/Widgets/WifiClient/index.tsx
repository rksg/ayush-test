import React, { useCallback, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSelectedNodePath }                                                    from '@acx-ui/analytics/utils'
import { DonutChart, ContentSwitcher, qualitativeColorSet, Card, Loader, NoData } from '@acx-ui/components'
import { AnalyticsFilter }                                                        from '@acx-ui/utils'

import { useTopNWifiClientQuery } from './services'

const colors = qualitativeColorSet()

const tabDetails = [
  { label: 'Device Type', value: 'deviceType' },
  { label: 'Manufacture', value: 'manufacture' }
]

export const WifiClient: React.FC<{ filters: AnalyticsFilter }> = ({ filters }) => {
  const { $t } = useIntl()
  const [selectedTab, setSelectedTab] = useState<'deviceType' | 'manufacturer'>('deviceType')

  const { startDate: start, endDate: end, filter } = filters
  const queryResults = useTopNWifiClientQuery({
    path: getSelectedNodePath(filter),
    start,
    end,
    n: 5
  })

  const results = queryResults?.data?.nodes?.[0]

  const getChartData = useCallback((data?: { name: string; value: number }[]) => {
    return data?.map((d, i) => ({
      name: d.name,
      value: d.value,
      color: colors[i]
    })) ?? []
  }, [])

  const chartData = useMemo(() => {
    if (!results) return []
    return getChartData(results[selectedTab])
  }, [results, selectedTab, getChartData])

  const title = $t({ defaultMessage: 'Wi-Fi Client' })
  const centerText = selectedTab === 'deviceType'
    ? $t({ defaultMessage: 'Total Wi-Fi Clients' })
    : $t({ defaultMessage: 'Total Devices' })

  return (
    <Loader states={[queryResults]}>
      <Card type='default' title={title}>
        {results ? (
          <>
            <div style={{ marginTop: -38 }}>
              <ContentSwitcher
                key={selectedTab}
                tabDetails={tabDetails.map(({ label, value }) => ({
                  label,
                  value,
                  children: null
                }))}
                value={selectedTab}
                onChange={(value) => setSelectedTab(value as 'deviceType' | 'manufacturer')}
                size='small'
                align='right'
                noPadding
              />
            </div>
            <AutoSizer>
              {({ height, width }) => (
                <DonutChart
                  data={chartData}
                  style={{ width: width * 0.9, height: height * 0.9 }}
                  legend='name-bold-value'
                  size='small'
                  showLegend
                  showTotal
                  value={centerText}
                  labelTextStyle={{ overflow: 'breakAll', width: 240 }}
                />
              )}
            </AutoSizer>
          </>
        ) : (
          <NoData />
        )}
      </Card>
    </Loader>
  )
}
