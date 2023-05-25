import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'


import { PageHeader, RangePicker, Tabs } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { ClientDualTable }               from '@acx-ui/rc/components'
import { useNavigate, useTenantLink }    from '@acx-ui/react-router-dom'
import { EmbeddedReport }                from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'
import { filterByAccess }                from '@acx-ui/user'
import { DateRange, getDateRangeFilter } from '@acx-ui/utils'

import { GuestsTab } from './GuestsTab'

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
  headerExtra?: JSX.Element[]
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
  const [range, setRange] = useState(DateRange.allTime)
  const [startDate, setStartDate] = useState(moment(undefined).toString())
  const [endDate, setEndDate] = useState(moment(undefined).toString())
  const dateFilter = {
    range,
    setRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate
  }
  const setDateFilter = function (data: {
    range: DateRange,
    startDate?: string,
    endDate?: string
  }) {
    const period = getDateRangeFilter(data.range, data.startDate, data.endDate)
    setRange(period.range)
    setStartDate(period.startDate)
    setEndDate(period.endDate)
  }
  const { $t } = useIntl()
  const listTab = {
    key: WirelessTabsEnum.CLIENTS,
    title: $t({ defaultMessage: 'Clients List' }),
    component: <ClientDualTable />
  }
  const apReportTab = {
    key: WirelessTabsEnum.GUESTS,
    title: $t({ defaultMessage: 'Guest Pass Credentials' }),
    component: <GuestsTab dateFilter={dateFilter}/>,
    headerExtra: [<RangePicker
      selectionType={range}
      showAllTime={true}
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
    />]
  }
  const airtimeReportTab = {
    key: WirelessTabsEnum.CLIENT_REPORT,
    title: $t({ defaultMessage: 'Wireless Clients Report' }),
    component: <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.CLIENT]} />
  }
  return [
    listTab,
    apReportTab,
    ...(useIsSplitOn(Features.NAVBAR_ENHANCEMENT) ? [airtimeReportTab] : [])
  ]
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
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wireless' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Cients' }) }]}
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
