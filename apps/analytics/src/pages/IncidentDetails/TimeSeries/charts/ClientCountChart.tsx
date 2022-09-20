import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                  from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { intlFormats }                    from '@acx-ui/utils'

import { ChartsData } from '../services'

export const ClientCountChart = ({ data }: { data: ChartsData }) => {
  const { clientCountChart } = data
  const { $t } = useIntl()

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
          dataFormatter={(value: unknown) =>
            $t(intlFormats.countFormat, { value: value as number })}
        />
      )}
    </AutoSizer>
  </Card>
}
