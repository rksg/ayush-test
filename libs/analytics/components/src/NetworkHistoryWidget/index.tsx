import { useAnalyticsFilter } from '@acx-ui/analytics/utils'

import { NetworkHistory } from '../NetworkHistory'

export const NetworkHistoryWidget = () => {
  const { filters } = useAnalyticsFilter()
  return <NetworkHistory hideLegends filters={filters} />
}