import React, { useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, ContentSwitcher, qualitativeColorSet, Card, Loader, NoData } from '@acx-ui/components'
import { AnalyticsFilter }                                                        from '@acx-ui/utils'

import { useTopNDeviceTypeQuery } from './services'
import * as UI                    from './styledComponents'

const colors = qualitativeColorSet()

const tabDetails = [
  { label: 'Device Type', value: 'deviceType', children: null },
  { label: 'Manufacture', value: 'manufacture', children: null }
]

export const WifiClient: React.FC<{ filters: AnalyticsFilter }> = ({ filters }) => {
  const { $t } = useIntl()
  const [tab, setTab] = useState('deviceType')
  const { startDate: start, endDate: end, filter } = filters
  const queryResults = useTopNDeviceTypeQuery({
    filter: filter,
    start: start,
    end: end,
    n: 5
  })

  const pieData = queryResults?.data?.nodes?.map((d, i) => ({
    value: d.count,
    name: tab === 'deviceType' ? d.osType : d.manufacturer,
    color: colors[i]
  }))

  const title = $t({ defaultMessage: 'Wi-Fi Client' })

  const centerText = tab === 'deviceType'
    ? $t({ defaultMessage: 'Total Wi-Fi Clients' })
    : $t({ defaultMessage: 'Total Devices' })

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ width, height }) => (
          queryResults?.data?.nodes?.length ? (
            <Card type='default' title={title}>
              <div style={{ marginTop: -35 }}>
                <ContentSwitcher
                  key={tab}
                  tabDetails={tabDetails.map(t => ({ ...t, children: null }))}
                  value={tab}
                  onChange={setTab}
                  size='small'
                  align='right'
                  noPadding
                />
              </div>
              <UI.FlexRow style={{ marginTop: 24 }}>
                <DonutChart
                  data={pieData!}
                  style={{ width: width, height: height }}
                  legend='name-value'
                  size='small'
                  showLegend={true}
                  showTotal={true}
                  value={centerText}
                  labelTextStyle={{ overflow: 'breakAll', width: 240 }}
                />
              </UI.FlexRow>
            </Card>) : <NoData />
        )}
      </AutoSizer>
    </Loader>
  )
}
