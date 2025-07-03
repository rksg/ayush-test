import { useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, ContentSwitcher, Loader, NoData, HistoricalCard } from '@acx-ui/components'

import { ContentSwitcherWrapper } from '../../styledComponents'
import { Mdu360TabProps }         from '../../types'

import { useTopNWifiClientQuery } from './services'


export const WifiClient = ({ filters }: { filters: Mdu360TabProps }) => {
  const { $t } = useIntl()
  const [selectedTab, setSelectedTab] = useState<'deviceType' | 'manufacturer'>('deviceType')

  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNWifiClientQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    start,
    end,
    n: 5
  })

  const tabDetails = [
    { label: $t({ defaultMessage: 'Device Type' }), value: 'deviceType', children: null },
    { label: $t({ defaultMessage: 'Manufacturer' }), value: 'manufacturer', children: null }
  ]

  const results = queryResults?.data?.nodes?.[0]
  const chartData = (results?.[selectedTab] ?? [])
  const title = $t({ defaultMessage: 'Wi-Fi Client' })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard type='default' title={title}>
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher
                tabDetails={tabDetails}
                value={selectedTab}
                onChange={(value) => setSelectedTab(value as 'deviceType' | 'manufacturer')}
                size='small'
                align='right'
              />
              {chartData && chartData.length > 0 ? (
                <AutoSizer>
                  {({ height, width }) => (
                    <DonutChart
                      data={chartData}
                      style={{ width: width, height: height }}
                      legend='name-bold-value'
                      size='large'
                      showLegend
                      showTotal
                      showLabel
                      showValue
                    />
                  )}
                </AutoSizer>
              ) : (
                <NoData />
              )}
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
