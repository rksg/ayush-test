import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  TimeSeriesData,
  getSeriesData
}                                         from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'

import { ChartsData } from '../services'


const ttcByFailureTypeChartQuery = () => gql`
  ttcByFailureTypeChart: timeSeries(granularity: $granularity) {
    time
    ttcByFailureTypes {
      ttcByEap
      ttcByDhcp
      ttcByAuth
      ttcByAssoc
      ttcByRadius
    }
  }
  `

// const prettyNames = name => ({
//   ttcByEap: { long: t('EAP Stage'), short: t('EAP') },
//   ttcByDhcp: { long: t('DHCP Stage'), short: t('DHCP') },
//   ttcByAuth: { long: t('Authentication Stage'), short: t('Authentication') },
//   ttcByAssoc: { long: t('Association Stage'), short: t('Association') },
//   ttcByRadius: { long: t('Radius Stage'), short: t('Radius') }
// }[name])

export const TtcByFailureTypeChart = ({ data }: { data: ChartsData }) => {
  const { ttcByFailureTypeChart: { time, ttcByFailureTypes } } = data
  const intl = useIntl()
  const { $t } = intl

  const seriesMapping = [
    { key: 'ttcByAuth', name: $t({ defaultMessage: 'Authentication' }) },
    { key: 'ttcByAssoc', name: $t({ defaultMessage: 'Association' }) },
    { key: 'ttcByEap', name: $t({ defaultMessage: 'EAP' }) },
    { key: 'ttcByRadius', name: $t({ defaultMessage: 'Radius' }) },
    { key: 'ttcByDhcp', name: $t({ defaultMessage: 'DHCP' }) }
  ]

  const chartResults = getSeriesData({
    time,
    ...ttcByFailureTypes
  } as TimeSeriesData, seriesMapping)

  return <Card title={$t({ defaultMessage: 'TIME TO CONNECT (BY STAGE)' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          // dataFormatter={formatter('countFormat')}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: TtcByFailureTypeChart, query: ttcByFailureTypeChartQuery }
export default chartConfig
