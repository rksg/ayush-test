import { FormattedMessage, useIntl } from 'react-intl'

import { useAnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { Tooltip }                                            from '@acx-ui/components'
import { Tabs }                                               from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { HealthPage } from '..'

import { OverviewTab }         from './OverviewTab'
import { useSwitchCountQuery } from './OverviewTab/SummaryBoxes/services'

export function HealthTabs () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const basePath = useTenantLink('/analytics/health/')

  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const { filters } = useAnalyticsFilter()
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate,
    wirelessOnly: false
  }

  const { data } = useSwitchCountQuery(payload)

  // eslint-disable-next-line no-console
  console.log('#### switchCount:', data?.switchCount)

  const wirelessOnly = data?.switchCount === 0

  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='overview'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview'>
      <OverviewTab wirelessOnly={wirelessOnly}/>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless'>
      <HealthPage />
    </Tabs.TabPane>
    <Tabs.TabPane tab={
      wirelessOnly ?
        <Tooltip
          title={
            <FormattedMessage
              defaultMessage={`Switches have not been on boarded in your SmartZone
              or there is <b>no RUCKUS switch</b> in your network`}
              values={{
                b: (content: string) => <b>{content}</b>
              }}
            />
          }>
          <span>{$t({ defaultMessage: 'Wired' })}</span>
        </Tooltip>
        :
        $t({ defaultMessage: 'Wired' })
    }
    key='wired'
    disabled={wirelessOnly}>
      <div>
        Health Wired Page
      </div>
    </Tabs.TabPane>
  </Tabs>
}
