import { useState } from 'react'

import moment from 'moment'

import { ClientDualTable } from '@acx-ui/rc/components'
import { useParams }       from '@acx-ui/react-router-dom'
import { DateRange }       from '@acx-ui/utils'

import { GuestsTab } from './GuestsTab'
import PageHeader    from './PageHeader'


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

  return activeTab === 'clients'
    ? <>
      <PageHeader dateFilter={dateFilter}/>
      { <ClientDualTable /> }
    </>
    : <>
      <PageHeader dateFilter={dateFilter}/>
      <GuestsTab dateFilter={dateFilter}/>
    </>
}
