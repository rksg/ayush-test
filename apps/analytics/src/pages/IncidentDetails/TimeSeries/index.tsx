import { useIntl } from 'react-intl'

import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'

import { useChartsQuery } from './services'
import { formatter } from '@acx-ui/utils'
import { IncidentDetailsProps } from '../types'

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

export interface TimeSeriesType {
  type: 'clients' | 'failures' | 'detailed-failures'
}

interface TimeSeriesProps 
  extends IncidentDetailsProps {
    incident: IncidentDetailsProps
  }

function TimeSeries (props) {
  const { $t } = useIntl()
  const queryResults = useChartsQuery(props)
  const title = $t({ defaultMessage: 'Clients' })
  return (
    <Loader states={[queryResults]}>
      <Card title={title}>
        <MultiLineTimeSeriesChart
          data={queryResults.data}
          lineColors={lineColors}
          dataFormatter={formatter('countFormat') as () => string}
        />
      </Card>
    </Loader>
  )
}

export default TimeSeries
