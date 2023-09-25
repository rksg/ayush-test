import { useIntl } from 'react-intl'

import { useHeaderExtra }                                 from '@acx-ui/analytics/components'
import { PageHeader, Tabs }                               from '@acx-ui/components'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'

import { SwitchList } from './SwitchList'

export enum AISwitchTabsEnum {
  LIST = 'switch',
  WIRED_REPORT = 'switch/reports/wired'
}

interface SwitchTab {
  key: AISwitchTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

const useTabs = () : SwitchTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: AISwitchTabsEnum.LIST,
    title: $t({ defaultMessage: 'Switch List' }),
    component: <SwitchList />,
    headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
  }
  const wiredReportTab = {
    key: AISwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRED}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WIRED)
  }
  return [listTab, wiredReportTab]
}

export function AISwitches ({ tab }: { tab: AISwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}

export default AISwitches