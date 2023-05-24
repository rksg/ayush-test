import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport }             from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'
import { filterByAccess } from '@acx-ui/user'

import useSwitchesTable from './SwitchesTable'

export enum SwitchTabsEnum {
  LIST = 'switch',
  WIRED_REPORT = 'switch/reports/wired'
}

interface WifiTab {
  key: SwitchTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : WifiTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: SwitchTabsEnum.LIST,
    ...useSwitchesTable()
  }
  const wiredReportTab = {
    key: SwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    component: <EmbeddedReport embedDashboardName={reportTypeDataStudioMapping[ReportType.WIRED]} />
  }
  return [
    listTab,
    wiredReportTab
  ]
}

export function SwitchList ({ tab }: { tab: SwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={filterByAccess(tabs.find(({ key }) => key === tab)?.headerExtra)}
    />
    {TabComp}
  </>
}
