import moment from 'moment-timezone'

import { PageHeader, PageHeaderProps, RangePicker } from '@acx-ui/components'
import { get }                                      from '@acx-ui/config'
import { getShowWithoutRbacCheckKey }               from '@acx-ui/user'
import { useDateFilter }                            from '@acx-ui/utils'

import { NetworkFilter }      from '../NetworkFilter'
import { MlisaNetworkFilter } from '../NetworkFilter/mlisaNetworkFilter'

const isMLISA = get('IS_MLISA_SA')
export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type useHeaderExtraProps = {
  shouldQuerySwitch?: boolean,
  withIncidents?: boolean,
  excludeNetworkFilter?: boolean,
}
type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & useHeaderExtraProps

const Filter = (
  { shouldQuerySwitch, withIncidents, excludeNetworkFilter }: useHeaderExtraProps
) => {
  return excludeNetworkFilter
    ? null
  /* istanbul ignore next */
    : isMLISA ? <MlisaNetworkFilter /> : <NetworkFilter
      key={getShowWithoutRbacCheckKey('network-filter')}
      shouldQuerySwitch={Boolean(shouldQuerySwitch)}
      withIncidents={withIncidents}
    />
}

export const useHeaderExtra = (props: useHeaderExtraProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  return [
    <Filter
      key={getShowWithoutRbacCheckKey('network-filter')}
      {...props}
    />,
    <RangePicker
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

export const Header = ({ shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  return <PageHeader
    {...props}
    title={props.title}
    extra={useHeaderExtra({ shouldQuerySwitch, withIncidents })}
  />
}
