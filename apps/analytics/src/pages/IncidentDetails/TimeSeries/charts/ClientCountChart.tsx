import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                  from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/utils'

import { ChartsData } from '../services'

const clientCountChartQuery = () => gql`
  clientCountChart: timeSeries(granularity: $granularity) {
    time
    newClientCount: connectionAttemptCount
    impactedClientCount: impactedClientCountByCode(filter: {code: $code})
    connectedClientCount
  }
`

export const ClientCountChart = ({ data }: { data: ChartsData }) => {
  const { clientCountChart } = data
  const intl = useIntl()
  const { $t } = intl

  const seriesMapping = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
    { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
  ]

  const chartResults = getSeriesData(clientCountChart, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Clients' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ClientCountChart, query: clientCountChartQuery }
export default chartConfig
