import moment from 'moment-timezone'

import { getDefaultEarliestStart, PageHeader, PageHeaderProps, RangePicker, TimeRangeDropDown } from '@acx-ui/components'
import { get }                                                                                  from '@acx-ui/config'
import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { getShowWithoutRbacCheckKey }                                                           from '@acx-ui/user'
import { useDateFilter }                                                                        from '@acx-ui/utils'

import { NetworkFilter }   from '../NetworkFilter'
import { SANetworkFilter } from '../NetworkFilter/SANetworkFilter'

const isMLISA = get('IS_MLISA_SA')

export type UseHeaderExtraProps = {
  shouldQueryAp?: boolean,
  shouldQuerySwitch?: boolean,
  shouldShowOnlyDomains?: boolean,
  withIncidents?: boolean,
  excludeNetworkFilter?: boolean,
  /** @default 'datepicker' */
  datepicker?: 'dropdown' | 'datepicker'
}
type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & UseHeaderExtraProps

export const Filter = (
  { shouldQueryAp = true, shouldQuerySwitch, shouldShowOnlyDomains,
    withIncidents, excludeNetworkFilter }: UseHeaderExtraProps
) => {
  return excludeNetworkFilter
    ? null
    : isMLISA
      ? <SANetworkFilter
        shouldQueryAp={Boolean(shouldQueryAp)}
        shouldQuerySwitch={Boolean(shouldQuerySwitch)}
        shouldShowOnlyDomains={Boolean(shouldShowOnlyDomains)} />
      : <NetworkFilter
        key={getShowWithoutRbacCheckKey('network-filter')}
        shouldQueryAp={Boolean(shouldQueryAp)}
        shouldQuerySwitch={Boolean(shouldQuerySwitch)}
        shouldShowOnlyVenues={Boolean(shouldShowOnlyDomains)}
        withIncidents={withIncidents}
      />
}

export const useHeaderExtra = ({ datepicker, ...props }: UseHeaderExtraProps) => {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  return [
    <Filter
      key={getShowWithoutRbacCheckKey('network-filter')}
      {...props}
    />,
    datepicker === 'dropdown'
      ? <TimeRangeDropDown key={getShowWithoutRbacCheckKey('time-range-dropdown')} />
      : <RangePicker
        key={getShowWithoutRbacCheckKey('range-picker')}
        selectedRange={{
          startDate: moment(startDate),
          endDate: moment(endDate)
        }}
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
        maxMonthRange={isDateRangeLimit ? 1 : 3}
      />
  ]
}

export const Header = ({
  shouldQueryAp, shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  return <PageHeader
    {...props}
    title={props.title}
    extra={useHeaderExtra({ shouldQueryAp, shouldQuerySwitch, withIncidents })}
  />
}
