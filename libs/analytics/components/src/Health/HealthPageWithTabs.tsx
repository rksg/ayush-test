import { useIntl } from 'react-intl'

import { useAnalyticsFilter }  from '@acx-ui/analytics/utils'
import {
  PageHeader,
  Tabs,
  TimeRangeDropDownProvider
} from '@acx-ui/components'
import { useNavigate, useTenantLink, useLocation } from '@acx-ui/react-router-dom'
import { hasRaiPermission }                        from '@acx-ui/user'
import { DateRange }                               from '@acx-ui/utils'

import { UseHeaderExtraProps, useHeaderExtra } from '../Header'
import { OverviewTab }                         from '../HealthTabs/OverviewTab'
import { useSwitchCountQuery }                 from '../HealthTabs/OverviewTab/SummaryBoxes/services'
import { WiredTab }                            from '../HealthTabs/WiredTab'

import { HealthPage } from '.'

export enum HealthTabEnum {
  OVERVIEW = 'overview',
  WIRELESS = 'wireless',
  WIRED = 'wired',
}

interface Tab {
  key: HealthTabEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const location = useLocation()
  const basePath = useTenantLink('/analytics/health')

  const { filters } = useAnalyticsFilter()
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate,
    wirelessOnly: false
  }
  const { data } = useSwitchCountQuery(payload)
  const wirelessOnly = data?.switchCount === 0

  const getHeaderExtraOptions = (): Partial<UseHeaderExtraProps> => {
    const path = location.pathname.replace(basePath.pathname, '').split('/').slice(0, 3).join('/')
    switch (path) {
      case '/overview':
        return {
          shouldQuerySwitch: true,
          shouldShowOnlyDomains: true
        }
      case '/wired':
      case '/wireless':
      default:
        return {
          shouldQueryAp: true,
          shouldQuerySwitch: true
        }
    }
  }

  const useOverviewTab = () => ({
    key: HealthTabEnum.OVERVIEW,
    title: $t({ defaultMessage: 'Overview' }),
    component: <OverviewTab wirelessOnly={wirelessOnly}/>,
    headerExtra: useHeaderExtra({ ...getHeaderExtraOptions() })
  })

  const useWirelessTab = () => ({
    key: HealthTabEnum.WIRELESS,
    title: $t({ defaultMessage: 'Wireless' }),
    component: <HealthPage showHeader={false}/>,
    headerExtra: useHeaderExtra({ ...getHeaderExtraOptions() })
  })

  const useWiredTab = () => ({
    key: HealthTabEnum.WIRED,
    title: $t({ defaultMessage: 'Wired' }),
    component: <WiredTab noSwitches={wirelessOnly}/>,
    headerExtra: useHeaderExtra({ ...getHeaderExtraOptions() })
  })

  const tabs = []
  if (hasRaiPermission('READ_HEALTH')) {
    tabs.push(useOverviewTab)
    tabs.push(useWirelessTab)
    tabs.push(useWiredTab)
  }
  return tabs.map(tab => tab()) // prevent calling API we do not need to call (permissions)
}

export function HealthPageWithTabs ({ tab }:{ tab: HealthTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/health')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <TimeRangeDropDownProvider availableRanges={[DateRange.last7Days, DateRange.last30Days]}>
    <PageHeader
      title={$t({ defaultMessage: 'Health' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'Network Assurance' }) }
      ]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </TimeRangeDropDownProvider>
}
