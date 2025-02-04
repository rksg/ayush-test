import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                               from '@acx-ui/components'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'
import { filterByAccess }                                 from '@acx-ui/user'

import useEdgeNokiaOltTable from '../Edge/Olt/OltTable'

import useSwitchesTable from './SwitchesTable'

export enum SwitchTabsEnum {
  LIST = 'switch',
  OPTICAL = 'optical',
  WIRED_REPORT = 'switch/reports/wired'
}

interface SwitchTab {
  key: SwitchTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

export function SwitchList ({ tab }: { tab: SwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const edgeOltTabInfo = useEdgeNokiaOltTable()

  const tabs = [{
    key: SwitchTabsEnum.LIST,
    ...useSwitchesTable()
  },
  ...(isNil(edgeOltTabInfo)
    ? []
    : [{
      key: SwitchTabsEnum.OPTICAL,
      ...edgeOltTabInfo
    }]),
  {
    key: SwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRED}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WIRED)
  }] as SwitchTab[]

  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })

  return <>
    <PageHeader
      // eslint-disable-next-line max-len
      title={tab === SwitchTabsEnum.OPTICAL ? $t({ defaultMessage: 'Wired Devices' }) : $t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ title, key }) => <Tabs.TabPane key={key} tab={title} />)}
        </Tabs>
      }
      extra={filterByAccess(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}
