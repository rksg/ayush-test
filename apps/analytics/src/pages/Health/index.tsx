import { useIntl } from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                from '../../components/Header'
import HealthTimeSeriesChart from '../../components/HealthConnectedClientsOverTime'

import { HealthPageContextProvider } from './HealthPageContext'

export default function HealthPage () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
    <HealthTimeSeriesChart filters={filters}/>
  </HealthPageContextProvider>
}
