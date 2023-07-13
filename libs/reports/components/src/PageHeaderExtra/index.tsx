import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { NetworkFilter } from '@acx-ui/analytics/components'
import { RangePicker }   from '@acx-ui/components'
import { useDateFilter } from '@acx-ui/utils'

import { ReportType, reportModeMapping, bandDisabledReports } from '../mapping/reportsMapping'

export function usePageHeaderExtra (type: ReportType, showFilter = true) {
  const { $t } = useIntl()
  const mode = reportModeMapping[type] || 'both'
  const isRadioBandDisabled = bandDisabledReports.includes(type) || false
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available for this report.' }) : ''

  const shouldQuerySwitch = ['switch','both'].includes(mode)
  const showRadioBand = ['ap','both'].includes(mode)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  const component = [
    <RangePicker
      key='range-picker'
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
      showTimePicker
      selectionType={range}
    />
  ]
  showFilter && component.unshift(
    <NetworkFilter
      key='reports-network-filter'
      shouldQuerySwitch={shouldQuerySwitch}
      showRadioBand={showRadioBand}
      multiple={true}
      filterMode={mode}
      filterFor={'reports'}
      isRadioBandDisabled={isRadioBandDisabled}
      radioBandDisabledReason={radioBandDisabledReason}
    />
  )

  return component
}
