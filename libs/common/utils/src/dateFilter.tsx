import { useMemo } from 'react'

import { message }         from 'antd'
import { ArgsProps }       from 'antd/lib/message'
import moment              from 'moment'
import { useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 }    from 'uuid'

import { DateRangeFilter, DateRange, getDateRangeFilter } from './dateUtil'
import { getIntl }                                        from './intlUtil'
import { useEncodedParameter }                            from './useEncodedParameter'

import type { Moment } from 'moment-timezone'


export interface DateFilter extends DateRangeFilter {
  initiated?: number // seconds
}

export const useDateFilter = ({
  earliestStart = undefined,
  showResetMsg = false
}: {
  earliestStart?: Moment;
  showResetMsg?: boolean;
} = {})=> {
  const { read, write } = useEncodedParameter<DateFilter>('period')
  const { $t } = getIntl()
  const period = read()
  const [, setSearch] = useSearchParams()

  return useMemo(() => {
    const earliestStartData = (earliestStart || moment().subtract(3, 'months').subtract(1, 'hour'))
    const isSameOrAfter = period && moment(period.startDate).isSameOrAfter(earliestStartData)
    const dateFilter = isSameOrAfter
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : getDateRangeFilter(DateRange.last24Hours)
    const setDateFilter = (date: DateFilter) => {
      write({
        ...date,
        initiated: (new Date()).getTime() // for when we click same relative date again
      })
    }
    const url = new URL(window.location.href)

    const clearDateFilter = () => {
      const newSearch = new URLSearchParams(window.location.search)
      newSearch.delete('period')
      setSearch(newSearch, { replace: true })
    }

    if(showResetMsg && url.searchParams.get('period') && !isSameOrAfter) {
      clearDateFilter()
      showToast({
        key: 'dateFilterResetToast',
        type: 'success',
        // eslint-disable-next-line max-len
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Note that your Calendar selection has been updated in line with current page default/max values.' }
        )
      })
    }

    return {
      dateFilter,
      setDateFilter,
      ...dateFilter
    } as const
  }, [read, write, period]) // eslint-disable-line react-hooks/exhaustive-deps
  // if we add earliestStart as deps, the date will start sliding again
}

type ToastType = 'info' | 'success' | 'error'

interface ToastProps extends ArgsProps {
  type: ToastType
  extraContent?: React.ReactNode
  closable?: boolean
  link?: { text?: string, onClick: Function }
}

export const showToast = (config: ToastProps): string | number => {
  const key = config.key || uuidv4()
  message.open({
    className: `toast-${config.type}`,
    key,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    icon: <></>,
    duration: 7,
    ...config
  })
  return key
}

