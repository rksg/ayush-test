import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Card,
  DonutChart,
  Loader,
  NoData,
  useDateRange
} from '@acx-ui/components'
import { formats } from '@acx-ui/formatter'

import { useTopNApplicationsQuery } from './services'

export const getTruncatedLegendFormatter = (
  chartData: { name: string, value: number }[], width: number
) => {
  return (name: string) => {
    const value = chartData.find(pie => pie.name === name)?.value || 0
    const legendWidth = width * 0.3

    const getCharWidth = (width: number) => {
      if (width > 200) return 9
      if (width > 170) return 12
      return 16
    }

    const maxLegendChars = Math.floor(legendWidth / getCharWidth(legendWidth))
    const truncatedName = name.length > maxLegendChars
      ? `${name.slice(0, maxLegendChars)}…`
      : name

    return `{legendNormal|${truncatedName}:} {legendBold|${formats.bytesFormat(value)}}`
  }
}


export const TopApplications = () => {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()
  const queryResults = useTopNApplicationsQuery({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    n: 10,
    range: selectedRange,
    filter: {}
  })
  const results = queryResults?.data
  const data = results?.topNApplicationByTraffic.map((item) => ({
    name: item.name,
    value: item.applicationTraffic
  }))
  return (
    <Loader states={[queryResults]}>
      <Card
        title={$t({ defaultMessage: 'Top 10 Applications By Traffic Volume' })}
      >
        {data && data.length > 0 ?
          <AutoSizer>
            {({ height, width }) => (
              <DonutChart
                data={data}
                style={{ width, height }}
                legend='name-bold-value'
                size='small'
                showLegend
                showTotal
                showValue
                showLabel
                dataFormatter={(value) => formats.bytesFormat(value as number)}
                legendFormatter={getTruncatedLegendFormatter(data, width)}
              />
            )}
          </AutoSizer>
          : <NoData />
        }
      </Card>
    </Loader>
  )
}
