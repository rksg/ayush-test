import { ReactElement } from 'react'

import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { nodeTypes, useAnalyticsFilter }                                      from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps, Loader, RangePicker, SuspenseBoundary } from '@acx-ui/components'
import { useDateFilter, dateRangeForLast, NodeType }                          from '@acx-ui/utils'

import NetworkFilter from '../NetworkFilter'

import { useNetworkNodeInfoQuery } from './services'
import { Divider }                 from './styledComponents'

const { DefaultFallback: Spinner } = SuspenseBoundary

const labelMap = {
  type: defineMessage({ defaultMessage: 'Type:' }),
  model: defineMessage({ defaultMessage: 'Model:' }),
  firmware: defineMessage({ defaultMessage: 'Firmware:' }),
  version: defineMessage({ defaultMessage: 'Firmware:' }),
  mac: defineMessage({ defaultMessage: 'MAC Address:' }),
  internalIp: defineMessage({ defaultMessage: 'IP Address:' }),
  apCount: defineMessage({ defaultMessage: 'APs:' }),
  clientCount: defineMessage({ defaultMessage: 'Clients:' }),
  portCount: defineMessage({ defaultMessage: 'Ports:' }),
  switchCount: defineMessage({ defaultMessage: 'Switches:' })
}

export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  shouldQuerySwitch: boolean,
  withIncidents?: boolean
}

export const useSubTitle = (subTitles: SubTitle[], type: NodeType): ReactElement => {
  const { $t } = useIntl()
  const subs = [{ key: 'type', value: [nodeTypes(type)] }, ...subTitles]
  return <span>
    {subs.map(({ key, value }, index) => {
      const labelKey = key as keyof typeof labelMap
      const content = value.length > 1 ? `${value[0]} (${value.length})` : `${value[0]}`
      return (
        <span key={key} title={value.join(', ')}>
          {$t(labelMap[labelKey])} {content}
          {index < subs.length - 1 && <Divider key={key} type='vertical' />}
        </span>
      )
    })}
  </span>
}

const Header = ({ shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  const { filters, getNetworkFilter } = useAnalyticsFilter()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const results = useNetworkNodeInfoQuery(filters)
  const state = { ...results, isLoading: false } // isLoading to false to prevent blank header on load
  const filter = filters?.filter?.networkNodes?.[0] // venue level uses filters
  const { networkFilter: { path } } = getNetworkFilter()
  const { name, type } = (filter || path).slice(-1)[0]

  return <PageHeader
    {...props}
    subTitle={<Loader states={[state]} fallback={<Spinner size='small' />}>
      {useSubTitle(results.data?.subTitle || [], type)}
    </Loader>}
    title={<Loader states={[state]} fallback={<Spinner size='default' />}>
      {filter || path.length > 1 ?
        (results.data?.name || name as string) // ap/switch name from data || venue name from filter
        : props.title}
    </Loader>}
    extra={[
      <NetworkFilter
        key='network-filter'
        shouldQuerySwitch={shouldQuerySwitch}
        withIncidents={withIncidents}
      />,
      <RangePicker
        key='range-picker'
        selectedRange={{
          startDate: moment(startDate),
          endDate: moment(endDate)
        }}
        enableDates={dateRangeForLast(3, 'months')}
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
      />
    ]}
  />
}

export default Header
