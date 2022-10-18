import { ReactElement, useMemo } from 'react'

import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { nodeTypes, useAnalyticsFilter }                    from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps, Loader, RangePicker } from '@acx-ui/components'
import { useDateFilter, dateRangeForLast, NodeType }        from '@acx-ui/utils'

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

export type SubTitle = {
  key: string
  value: (number | string)[]
}

export type HeaderData = {
  name?: string
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  data: HeaderData,
  shouldQuerySwitch: boolean,
  withIncidents?: boolean
}

export const useSubTitle = (subTitles: SubTitle[], type: NodeType): ReactElement => {
  const { $t } = useIntl()
  const subs = [{ key: 'type', value: [nodeTypes(type)] }, ...subTitles]
  return <>
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
  </>
}

export const Header = ({ data, shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filters, getNetworkFilter } = useAnalyticsFilter()
  const filter = filters?.filter?.networkNodes?.[0] // venue level uses filters
  const { networkFilter: { path } } = getNetworkFilter()
  const { name, type } = (filter || path).slice(-1)[0]
  const title = useMemo(() => (filter || path.length > 1)
    ? (data.name || name) // ap/switch name from data || venue name from filter
    : props.title,
  [data.name, filter, name, path.length, props.title]) // displays Incidents at root level
  const selectedRange = {
    startDate: moment(startDate),
    endDate: moment(endDate)
  }
  return (
    <PageHeader
      {...props}
      subTitle={useSubTitle(data.subTitle, type)}
      title={title}
      extra={[
        <NetworkFilter
          key='network-filter'
          shouldQuerySwitch={shouldQuerySwitch}
          withIncidents={withIncidents}
        />,
        <RangePicker
          key='range-picker'
          selectedRange={selectedRange}
          enableDates={dateRangeForLast(3, 'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
    />
  )
}

const ConnectedHeader = (
  props: PageHeaderProps & { shouldQuerySwitch : boolean, withIncidents?: boolean }
) => {
  const { filters } = useAnalyticsFilter()
  const queryResults = useNetworkNodeInfoQuery(filters)
  return (
    <ConnectedHeaderWrapper>
      <Loader states={[queryResults]}>
        <Header
          {...props}
          data={queryResults.data as HeaderData}
        />
      </Loader>
    </ConnectedHeaderWrapper>
  )
}

export default ConnectedHeader
