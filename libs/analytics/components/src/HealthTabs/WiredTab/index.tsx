import { useIntl } from 'react-intl'

import { useAnalyticsFilter, categoryTabs }      from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Tabs }                from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                  from '@acx-ui/utils'

import * as UI from '../../Health/styledComponents'

import { SummaryBoxes } from './SummaryBoxes'

const WiredTab = (props: { filters?: AnalyticsFilter, path?: string }) => {
  const { $t } = useIntl()
  const { filters: widgetFilters } = props
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters

  const params = useParams()
  const selectedTab = params['categoryTab'] ?? categoryTabs[0].value
  const navigate = useNavigate()
  const basePath = useTenantLink(props.path ?? '/analytics/health/wired/tab/')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <SummaryBoxes
          filters={healthPageFilters}
        />
      </GridCol>
      <GridCol col={{ span: 16 }}>
        <UI.TabTitle activeKey={selectedTab} onChange={onTabChange}>
          {categoryTabs.map(({ value, label }) => (
            <Tabs.TabPane tab={$t(label)} key={value} />
          ))}
        </UI.TabTitle>
      </GridCol>
      <GridCol col={{ span: 8 }}>
        <UI.ThresholdTitle>
          {$t({ defaultMessage: 'Customized SLA Threshold' })}
        </UI.ThresholdTitle>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        KPI page go here
      </GridCol>
    </GridRow>
  )
}
export { WiredTab }
