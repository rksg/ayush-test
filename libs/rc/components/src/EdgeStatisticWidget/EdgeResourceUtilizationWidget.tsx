import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData
} from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

function EdgeResourceUtilizationWidget () {
  const { $t } = useIntl()

  // TODO: wait for backend support, use fake empty data for testing
  // API response format is still TBD
  const queryResults = { data: [], isLoading: false }

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Resource Utilization' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                dataFormatter={formatter('bytesFormat')}
                seriesFormatters={{
                  cpu: formatter('hertzFormat'),
                  memory: formatter('bytesFormat'),
                  storage: formatter('bytesFormat')
                }}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

export { EdgeResourceUtilizationWidget }