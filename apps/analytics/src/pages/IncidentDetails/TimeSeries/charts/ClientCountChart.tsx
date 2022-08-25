import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident }                 from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import { formatter }                from '@acx-ui/utils'

import { ChartsData } from '../services'

const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-orange-50')
]

export const ClientCountChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { clientCountCharts } = data
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
    { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
  ]

  const chartResults = getSeriesData(clientCountCharts, seriesMapping)

  return <Card
    key={'clientCountChart'}
    title={$t({ defaultMessage: 'CLIENTS' })}
    setHeight={true}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          start={incident.startTime}
          end={incident.endTime}
          lineColors={lineColors}
        />
      )}
    </AutoSizer>
  </Card>
}
