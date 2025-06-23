import { useIntl } from 'react-intl'

import {
  PageHeader,
  Tabs,
  TimeRangeDropDownProvider
} from '@acx-ui/components'
import { get }                                     from '@acx-ui/config'
import { useIsSplitOn, Features }                  from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink, useLocation } from '@acx-ui/react-router-dom'
import { hasRaiPermission }                        from '@acx-ui/user'
import { DateRange }                               from '@acx-ui/utils'

import { ConfigChange }                        from '../ConfigChange'
import { UseHeaderExtraProps, useHeaderExtra } from '../Header'
import { HealthPage }                          from '../Health'
import { HealthTabs }                          from '../HealthTabs'
import { useServiceGuard }                     from '../ServiceGuard'
import { useVideoCallQoe }                     from '../VideoCallQoe'

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

  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)

  const getHeaderExtraOptions = (): Partial<UseHeaderExtraProps> => {
    const path = location.pathname.replace(basePath.pathname, '').split('/').slice(0, 3).join('/')
    switch (path) {
      case `/${NetworkAssuranceTabEnum.HEALTH}/overview`:
        return {
          shouldQuerySwitch: true,
          shouldShowOnlyDomains: true
        }
      case `/${NetworkAssuranceTabEnum.HEALTH}/wired`:
      case `/${NetworkAssuranceTabEnum.HEALTH}/wireless`:
      default:
        return {
          shouldQueryAp: true,
          shouldQuerySwitch: true
        }
    }
  }

  const useHealthTab = () => ({
    key: NetworkAssuranceTabEnum.HEALTH,
    title: $t({ defaultMessage: 'Health' }),
    component: isSwitchHealthEnabled ? <HealthTabs /> : <HealthPage/>,
    headerExtra: useHeaderExtra({
      ...(isSwitchHealthEnabled ? getHeaderExtraOptions() : { shouldQuerySwitch: false }),
      withIncidents: false
    })
  })

  const useServiceGuardTab = () => ({
    key: NetworkAssuranceTabEnum.SERVICE_GUARD,
    url: 'serviceValidation',
    ...useServiceGuard()
  })
  const useConfigChangeTab = () => ({
    key: NetworkAssuranceTabEnum.CONFIG_CHANGE,
    title: $t({ defaultMessage: 'Config Change' }),
    component: <ConfigChange/>,
    headerExtra: useHeaderExtra({
      shouldQuerySwitch: false,
      withIncidents: false,
      datepicker: 'dropdown'
    })
  })
  const useVideoCallQoeTab = () => ({
    key: NetworkAssuranceTabEnum.VIDEO_CALL_QOE,
    ...useVideoCallQoe()
  })
  const tabs = []
  if (hasRaiPermission('READ_HEALTH')) {
    tabs.push(useHealthTab)
  }
  if (hasRaiPermission('READ_SERVICE_VALIDATION')) {
    tabs.push(useServiceGuardTab)
  }
  if (hasRaiPermission('READ_CONFIG_CHANGE')) {
    tabs.push(useConfigChangeTab)
  }
  if (hasRaiPermission('READ_VIDEO_CALL_QOE') && !get('IS_MLISA_SA')) {
    tabs.push(useVideoCallQoeTab)
  }
  return tabs.map(tab => tab()) // prevent calling API we do not need to call (permissions)
}

export function NetworkAssurance ({ tab }:{ tab: NetworkAssuranceTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)
  const massagePath = (path: string) => {
    if (isSwitchHealthEnabled) {
      return path.replace('health', 'health/overview')
    }
    return path
  }

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: massagePath(
        `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
      )
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
