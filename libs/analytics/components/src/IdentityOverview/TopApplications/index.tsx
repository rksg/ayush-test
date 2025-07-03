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

export const TopApplications = () => {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()
  const queryResults = useTopNApplicationsQuery({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    n: 6,
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
              />
            )}
          </AutoSizer>
          : <NoData />
        }
      </Card>
    </Loader>
  )
}
