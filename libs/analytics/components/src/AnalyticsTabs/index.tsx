import { useIntl } from 'react-intl'

import { Tabs }                                from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                from '@acx-ui/utils'
import { useDateFilter }                       from '@acx-ui/utils'

import { IncidentTabContent, HealthPage } from '..'

export function AnalyticsTabs (props: {
  healthFilter: AnalyticsFilter,
  incidentFilter: AnalyticsFilter,
  healthPath: string
}) {
  const { healthFilter, incidentFilter, healthPath } = props
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const { activeSubTab } = useParams()
  const { dateFilter } = useDateFilter({ isDateRangeLimit })
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: activeSubTab
        ? location.pathname.replace(activeSubTab as string, tab)
        : `${location.pathname}/${tab}/overview`
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='incidents'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents'>
      <IncidentTabContent filters={{ ...dateFilter, ...incidentFilter }} />
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Health' })} key='health'>
      <HealthPage filters={{ ...dateFilter, ...healthFilter }} path={healthPath} />
    </Tabs.TabPane>
  </Tabs>
}
