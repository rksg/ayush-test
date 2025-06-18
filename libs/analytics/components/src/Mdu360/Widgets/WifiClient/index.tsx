import { useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, ContentSwitcher, Card, Loader, NoData } from '@acx-ui/components'

import { useTopNWifiClientQuery } from './services'

interface WifiClientFilters {
  startDate: string;
  endDate: string;
}

export const WifiClient = ({ filters }: { filters: WifiClientFilters }) => {
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
      <Card
        title={title}
        extra={<ContentSwitcher
          tabDetails={tabDetails}
          value={selectedTab}
          onChange={(value) => setSelectedTab(value as 'deviceType' | 'manufacturer')}
          size='small'
          align='center'
          noPadding
          style={{ padding: 0 }}
        />}
      >
        {chartData?.length ? (
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
      </Card>
    </Loader>
  )
}
