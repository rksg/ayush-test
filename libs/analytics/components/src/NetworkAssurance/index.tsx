import { useIntl } from 'react-intl'

import {
  PageHeader,
  Tabs,
  TimeRangeDropDownProvider
} from '@acx-ui/components'
import { get }                                     from '@acx-ui/config'
import { useIsSplitOn, Features }                  from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink, useLocation } from '@acx-ui/react-router-dom'
import { DateRange }                               from '@acx-ui/utils'

import { ConfigChange }    from '../ConfigChange'
import { useHeaderExtra }  from '../Header'
import { HealthPage }      from '../Health'
import { HealthTabs }      from '../HealthTabs'
import { useServiceGuard } from '../ServiceGuard'
import { useVideoCallQoe } from '../VideoCallQoe'

import type { UseHeaderExtraProps } from '../Header'

export enum NetworkAssuranceTabEnum {
  HEALTH = 'health',
  SERVICE_GUARD = 'serviceGuard',
  CONFIG_CHANGE = 'configChange',
  VIDEO_CALL_QOE = 'videoCallQoe'
}

interface Tab {
  key: NetworkAssuranceTabEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const location = useLocation()
  const basePath = useTenantLink('/analytics')

  const configChangeEnable = useIsSplitOn(Features.CONFIG_CHANGE)
  const videoCallQoeEnabled = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)

  const getHeaderExtraOptions = (): Partial<UseHeaderExtraProps> => {
    const path = location.pathname.replace(basePath.pathname, '')
    switch (path) {
      case `/${NetworkAssuranceTabEnum.HEALTH}/overview`:
        return {
          shouldQuerySwitch: true,
          shouldShowOnlyDomains: true
        }
      case `/${NetworkAssuranceTabEnum.HEALTH}/wired`:
        return {
          shouldQueryAp: false,
          shouldQuerySwitch: true
        }
      case `/${NetworkAssuranceTabEnum.HEALTH}/wireless`:
      default:
        return {}
    }
  }

  const healthTab = {
    key: NetworkAssuranceTabEnum.HEALTH,
    title: $t({ defaultMessage: 'Health' }),
    component: isSwitchHealthEnabled ? <HealthTabs /> : <HealthPage/>,
    headerExtra: useHeaderExtra({
      ...(isSwitchHealthEnabled ? getHeaderExtraOptions() : { shouldQuerySwitch: false }),
      withIncidents: false
    })
  }

  const serviceGuardTab = {
    key: NetworkAssuranceTabEnum.SERVICE_GUARD,
    url: 'serviceValidation',
    ...useServiceGuard()
  }
  const configChangeTab = {
    key: NetworkAssuranceTabEnum.CONFIG_CHANGE,
    title: $t({ defaultMessage: 'Config Change' }),
    component: <ConfigChange/>,
    headerExtra: useHeaderExtra({
      shouldQuerySwitch: false,
      withIncidents: false,
      datepicker: 'dropdown'
    })
  }
  const videoCallQoeTab = {
    key: NetworkAssuranceTabEnum.VIDEO_CALL_QOE,
    ...useVideoCallQoe()
  }
  return [
    healthTab,
    serviceGuardTab,
    ...(get('IS_MLISA_SA') || configChangeEnable ? [configChangeTab] : []),
    ...(!get('IS_MLISA_SA') && videoCallQoeEnabled ? [videoCallQoeTab] : [])
  ]
}

export function NetworkAssurance ({ tab }:{ tab: NetworkAssuranceTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <TimeRangeDropDownProvider availableRanges={[DateRange.last7Days, DateRange.last30Days]}>
    <PageHeader
      title={$t({ defaultMessage: 'Network Assurance' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'AI Assurance' }) }]}
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
