import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { useIsSplitOn, Features }     from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }             from '@acx-ui/user'

import { useHeaderExtra }  from '../Header'
import { HealthPage }      from '../Health'
import { useServiceGuard } from '../ServiceGuard'
import { useVideoCallQoe } from '../VideoCallQoe'

export enum NetworkAssuranceTabEnum {
  HEALTH = 'health',
  SERVICE_GUARD = 'serviceGuard',
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
  const healthTab = {
    key: NetworkAssuranceTabEnum.HEALTH,
    title: $t({ defaultMessage: 'Health' }),
    component: <HealthPage/>,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: false, withIncidents: false })
  }
  const serviceGuardTab = {
    key: NetworkAssuranceTabEnum.SERVICE_GUARD,
    url: 'serviceValidation',
    ...useServiceGuard()
  }
  const videoCallQoeTab = {
    key: NetworkAssuranceTabEnum.VIDEO_CALL_QOE,
    ...useVideoCallQoe()
  }
  return [
    healthTab,
    serviceGuardTab,
    ...(useIsSplitOn(Features.VIDEO_CALL_QOE) ? [videoCallQoeTab] : [])
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
  return <>
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
  </>
}
