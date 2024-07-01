import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { NetworkFilter, SANetworkFilter } from '@acx-ui/analytics/components'
import { RangePicker }                    from '@acx-ui/components'
import { get }                            from '@acx-ui/config'
import { getShowWithoutRbacCheckKey }     from '@acx-ui/user'
import { useDateFilter }                  from '@acx-ui/utils'

import {
  ReportType,
  reportTypeMapping,
  bandDisabledReports,
  networkFilterDisabledReports } from '../mapping/reportsMapping'

export function usePageHeaderExtra (type: ReportType, showFilter = true) {
  const { $t } = useIntl()
  const reportType = reportTypeMapping[type]
  const isRadioBandDisabled = bandDisabledReports.includes(type) || false
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available for this report.' }) : ''

  const isSwitchReport = ['switch','both'].includes(reportType)
  const isAPReport = ['ap','both'].includes(reportType)
  const isNetworkFilterDisabled = networkFilterDisabledReports.includes(type)

  const { startDate, endDate, setDateFilter, range } = useDateFilter(moment().subtract(12, 'month'))

  const component = [
    <RangePicker
      key={getShowWithoutRbacCheckKey('range-picker')}
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
      showTimePicker
      selectionType={range}
      isReport
    />
  ]
  showFilter && !isNetworkFilterDisabled && component.unshift(
    get('IS_MLISA_SA')
      ? <SANetworkFilter
        key={getShowWithoutRbacCheckKey('sa-network-filter')}
        shouldQueryAp={isAPReport}
        shouldQuerySwitch={isSwitchReport}
        overrideFilters={{ startDate, endDate }}
      />
      : <NetworkFilter
        key={getShowWithoutRbacCheckKey('reports-network-filter')}
        shouldQuerySwitch={isSwitchReport}
        shouldQueryAp={isAPReport}
        showRadioBand={isAPReport}
        multiple={true}
        filterFor={'reports'}
        isRadioBandDisabled={isRadioBandDisabled}
        radioBandDisabledReason={radioBandDisabledReason}
        overrideFilters={{ startDate, endDate }}
      />
  )

  return component
}
