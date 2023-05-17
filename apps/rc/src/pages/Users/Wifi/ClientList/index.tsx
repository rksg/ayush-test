import { useState } from 'react'

import moment from 'moment'

import { ClientDualTable } from '@acx-ui/rc/components'
import { useParams }       from '@acx-ui/react-router-dom'
import { DateRange }       from '@acx-ui/utils'

import { GuestsTab } from './GuestsTab'
import PageHeader    from './PageHeader'

type WirelessTabs = 'clients' | 'guests' | 'reports'

export default function ClientList () {
  const [range, setRange] = useState(DateRange.allTime)
  const [startDate, setStartDate] = useState(moment(undefined).toString())
  const [endDate, setEndDate] = useState(moment(undefined).toString())

  const { activeTab } = useParams()
  const dateFilter = {
    range,
    setRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate
  }

  const currentTab = (tab: WirelessTabs) => {
    switch(tab) {
      case 'clients':
        return <ClientDualTable />
      case 'guests':
        return <GuestsTab dateFilter={dateFilter}/>
      case 'reports':
        return <></> // return reports/clients
    }
  }

  return <>
    <PageHeader dateFilter={dateFilter} />
    {currentTab(activeTab as WirelessTabs)}
  </>
}
