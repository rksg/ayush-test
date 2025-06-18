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

  const chartData = (results?.[selectedTab] ?? []).map((d) => ({
    name: d.name,
    value: d.value
  }))

  const title = $t({ defaultMessage: 'Wi-Fi Client' })
  const centerText = selectedTab === 'deviceType'
    ? $t({ defaultMessage: 'Total Wi-Fi Clients' })
    : $t({ defaultMessage: 'Total Devices' })

  return (
    <Loader states={[queryResults]}>
      <Card type='default' title={title}>
        <div style={{ marginTop: -38 }}>
          <ContentSwitcher
            tabDetails={tabDetails.map(({ label, value, children }) => ({
              label,
              value,
              children
            }))}
            value={selectedTab}
            onChange={(value) => setSelectedTab(value as 'deviceType' | 'manufacturer')}
            size='small'
            align='right'
            noPadding
          />
        </div>
        {results && results?.[selectedTab]?.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <DonutChart
                data={chartData}
                style={{ width: width, height: height }}
                legend='name-bold-value'
                size='small'
                showLegend
                showTotal
                value={centerText}
                showLabel={true}
                showValue={true}
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
