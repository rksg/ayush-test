import moment from 'moment-timezone'

import { PageHeader, PageHeaderProps, RangePicker, TimeRangeDropDown } from '@acx-ui/components'
import { get }                                                         from '@acx-ui/config'
import { getShowWithoutRbacCheckKey }                                  from '@acx-ui/user'
import { useDateFilter }                                               from '@acx-ui/utils'

import { NetworkFilter }   from '../NetworkFilter'
import { SANetworkFilter } from '../NetworkFilter/SANetworkFilter'

const isMLISA = get('IS_MLISA_SA')
export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type UseHeaderExtraProps = {
  shouldQueryAp?: boolean,
  shouldQuerySwitch?: boolean,
  shouldShowOnlyDomains?: boolean,
  withIncidents?: boolean,
  excludeNetworkFilter?: boolean,
  /** @default 'datepicker' */
  datepicker?: 'dropdown' | 'datepicker'
}
type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & UseHeaderExtraProps

const Filter = (
  { shouldQueryAp, shouldQuerySwitch, shouldShowOnlyDomains,
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
        withIncidents={withIncidents}
      />
}

export const useHeaderExtra = ({ datepicker, ...props }: UseHeaderExtraProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  return [
    <Filter
      key={getShowWithoutRbacCheckKey('network-filter')}
      {...props}
    />,
    datepicker === 'dropdown'
      ? <TimeRangeDropDown/>
      : <RangePicker
        key={getShowWithoutRbacCheckKey('range-picker')}
        selectedRange={{
          startDate: moment(startDate),
          endDate: moment(endDate)
        }}
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
      />
  ]
}

export const useNetworkFilter = ({ ...props }) => {
  return <Filter
    key={getShowWithoutRbacCheckKey('network-filter')}
    {...props}
  />
}

export const Header = ({
  shouldQueryAp, shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  return <PageHeader
    {...props}
    title={props.title}
    extra={useHeaderExtra({ shouldQueryAp, shouldQuerySwitch, withIncidents })}
  />
}
