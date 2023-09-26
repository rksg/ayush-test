import { useEffect, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker }       from '@acx-ui/components'
import { useNavigate, useTenantLink }    from '@acx-ui/react-router-dom'
import { RolesEnum }                     from '@acx-ui/types'
import { useUserProfileContext }         from '@acx-ui/user'
import { DateRange, getDateRangeFilter } from '@acx-ui/utils'

import { GuestsTable } from '../ClientList/GuestsTab/GuestsTable'


export default function GuestManagerPage () {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const basePath = useTenantLink('/users/guestsManager')
  const navigate = useNavigate()
  const [range, setRange] = useState(DateRange.allTime)
  const [startDate, setStartDate] = useState(moment().subtract(50, 'year').seconds(0).toString())
  const [endDate, setEndDate] = useState(moment().add(50, 'year').seconds(0).toString())

  useEffect(() => {
    return () => {
      if(userProfile && userProfile.role === RolesEnum.GUEST_MANAGER) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}`
        })
      }
    }
  }, [userProfile])

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

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Guest Management' })}
      extra={
        <RangePicker
          selectionType={range}
          showAllTime={true}
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
        />}
    />
    <GuestsTable />
  </>
}
