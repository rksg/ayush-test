import moment from 'moment-timezone'

import { PageHeader, PageHeaderProps, RangePicker } from '@acx-ui/components'
import { useDateFilter }                            from '@acx-ui/utils'

import { NetworkFilter } from '../NetworkFilter'

export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type useHeaderExtraProps = {
  shouldQuerySwitch: boolean,
  withIncidents?: boolean
}
type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & useHeaderExtraProps

export const useHeaderExtra = (props: useHeaderExtraProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  return [
    <NetworkFilter
      key='network-filter'
      shouldQuerySwitch={props.shouldQuerySwitch}
      withIncidents={props.withIncidents}
    />,
    <RangePicker
      key='range-picker'
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
