import { ReactElement, ReactNode, useMemo } from 'react'

import { SerializedError }        from '@reduxjs/toolkit'
import { FetchBaseQueryError }    from '@reduxjs/toolkit/dist/query'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { nodeTypes, useAnalyticsFilter }                          from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps, Loader, RangePicker }       from '@acx-ui/components'
import { useDateFilter, dateRangeForLast, NodeType, NetworkPath } from '@acx-ui/utils'

import NetworkFilter from '../NetworkFilter'

import { useNetworkNodeInfoQuery }         from './services'
import { Divider, ConnectedHeaderWrapper } from './styledComponents'

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

interface QueryState {
  isLoading: boolean;
  error?: Error | SerializedError | FetchBaseQueryError;
  isFetching?: boolean;
  data: HeaderData,
}

export type SubTitle = {
  key: string
  value: (number | string)[]
  queryState?: QueryState
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  shouldQuerySwitch: boolean,
  withIncidents?: boolean,
  queryState: QueryState
}

export const useSubTitle =
(subTitles: SubTitle[], type: NodeType, queryState: QueryState): ReactElement => {
  const { $t } = useIntl()
  const subs = [{ key: 'type', value: [nodeTypes(type)] }, ...subTitles]
  return (<Loader states={[queryState]}>
    <span>
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
  </Loader>)
}

export const useTitle = (
  filter: NetworkPath | undefined,
  path: unknown[],
  data: HeaderData,
  name: unknown,
  title: ReactNode | undefined,
  queryState: QueryState
): ReactNode => {
  return <Loader states={[queryState]}>
    {filter || path.length > 1 ?
      (data.name || name as string) // ap/switch name from data || venue name from filter
      : title}
  </Loader>
}

export const Header =
({ shouldQuerySwitch, withIncidents, queryState, ...props }: HeaderProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filters, getNetworkFilter } = useAnalyticsFilter()
  const filter = filters?.filter?.networkNodes?.[0] // venue level uses filters
  const { networkFilter: { path } } = getNetworkFilter()
  const { name, type } = (filter || path).slice(-1)[0]
  const { data } = queryState
  return (
    <PageHeader
      {...props}
      subTitle={useSubTitle(data.subTitle, type, queryState)}
      title={useTitle(filter, path, data, name, props.title, queryState)}
      extra={useMemo(() => [
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
      ], [shouldQuerySwitch, withIncidents, startDate, endDate, range])} // eslint-disable-line react-hooks/exhaustive-deps
    />
  )
}

const ConnectedHeader = (
  props: PageHeaderProps & { shouldQuerySwitch : boolean, withIncidents?: boolean }
) => {
  const { filters } = useAnalyticsFilter()
  const queryResults = useNetworkNodeInfoQuery(filters)
  const { isLoading, isFetching, isError } = queryResults
  const queryState = { isError, isFetching, isLoading, data: queryResults.data as HeaderData }
  return (
    <ConnectedHeaderWrapper>
      <Loader states={[queryResults]}>
        <Header
          {...props}
          queryState={queryState}
        />
      </Loader>
    </ConnectedHeaderWrapper>
  )
}

export default ConnectedHeader
