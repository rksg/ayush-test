import { useState, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                               from '@acx-ui/components'
import { ClientTabContext, defaultClientPayload }         from '@acx-ui/rc/components'
import { useGetClientListQuery, useGetGuestsListQuery }   from '@acx-ui/rc/services'
import { usePollingTableQuery }                           from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'
import { filterByAccess }                                 from '@acx-ui/user'
import { DateRange }                                      from '@acx-ui/utils'

import { ClientTab }           from './ClientTab'
import { GuestsTab }           from './GuestsTab'
import { defaultGuestPayload } from './GuestsTab/GuestsDetail'
import { GuestTabContext }     from './GuestsTab/GuestsTable/context'


export enum WirelessTabsEnum {
  CLIENTS = 'clients',
  GUESTS = 'guests',
  CLIENT_REPORT = 'reports/clients'
}

interface WirelessTab {
  key: WirelessTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

export interface GuestDateFilter {
  range: DateRange,
  setRange: (v: DateRange) => void,
  startDate: string,
  setStartDate: (v: string) => void,
  endDate: string,
  setEndDate: (v: string) => void,
}

const useTabs = () : WirelessTab[] => {
  const clientTableQuery = usePollingTableQuery({
    useQuery: useGetClientListQuery,
    defaultPayload: { ...defaultClientPayload },
    search: {
      searchTargetFields: defaultClientPayload.searchTargetFields
    }
  })

  const guestTableQuery = usePollingTableQuery({
    useQuery: useGetGuestsListQuery,
    defaultPayload: {
      ...defaultGuestPayload
    },
    search: {
      searchTargetFields: ['name', 'mobilePhoneNumber', 'emailAddress']
    }
  })

  const [clientCount, setClientCount] = useState(0)
  const [guestCount, setGuestCount] = useState(0)

  useEffect(() => {
    setClientCount(clientTableQuery.data?.totalCount || 0)
  }, [clientTableQuery.data])

  useEffect(() => {
    setGuestCount(guestTableQuery.data?.totalCount || 0)
  }, [guestTableQuery.data])

  const { $t } = useIntl()
  const clientsTab = {
    key: WirelessTabsEnum.CLIENTS,
    title: $t({ defaultMessage: 'Clients List ({clientCount})' }, { clientCount }),
    component: <ClientTabContext.Provider value={{ setClientCount }}>
      <ClientTab />
    </ClientTabContext.Provider>,
    headerExtra: []
  }
  const guestTab = {
    key: WirelessTabsEnum.GUESTS,
    title: $t({ defaultMessage: 'Guest Pass Credentials ({guestCount})' }, { guestCount }),
    component: <GuestTabContext.Provider value={{ setGuestCount }}>
      <GuestsTab />
    </GuestTabContext.Provider>,
    headerExtra: []
  }
  const wirelessClientReportTab = {
    key: WirelessTabsEnum.CLIENT_REPORT,
    title: $t({ defaultMessage: 'Wireless Clients Report' }),
    component: <EmbeddedReport
      reportName={ReportType.CLIENT}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.CLIENT)
  }
  return [clientsTab, guestTab, wirelessClientReportTab]
}

export function WifiClientList ({ tab }: { tab: WirelessTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/users/wifi/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wireless' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={filterByAccess(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}
