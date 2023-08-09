import { ReactElement } from 'react'

import { omit }                   from 'lodash'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { getSelectedNodePath, nodeTypes, useAnalyticsFilter, getFilterPayload } from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps, Loader, RangePicker, SuspenseBoundary }   from '@acx-ui/components'
import { useDateFilter, NodeType }                                              from '@acx-ui/utils'

import { NetworkFilter }                from '../NetworkFilter'
import { useNetworkFilterQuery, Child } from '../NetworkFilter/services'

import { useNetworkNodeInfoQuery } from './services'
import { Divider }                 from './styledComponents'

import { SubTitle } from '.'

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

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  shouldQuerySwitch: boolean,
  withIncidents?: boolean
}

const useSubTitle = (subTitles: SubTitle[], type: NodeType): ReactElement => {
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

// there is an issue in api for venue name, it returns from path instead of getting it from druid and it is the id
function getVenueName (name: string, data: Child[] | undefined): string {
  const venue = data?.find(({ id }) => id === name)
  return venue?.name || name
}

export const HeaderLegacy = ({ shouldQuerySwitch, withIncidents, ...props }: HeaderProps) => {
  const { filters } = useAnalyticsFilter()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const results = useNetworkNodeInfoQuery({
    ...filters,
    ...getFilterPayload({ filter: filters.filter })
  })
  const networkFilter = omit({ ...filters, shouldQuerySwitch }, 'path', 'filter')
  const filterResult = useNetworkFilterQuery(networkFilter)
  const state = { ...results, ...filterResult, isLoading: false } // isLoading to false to prevent blank header on load
  const path = getSelectedNodePath(filters.filter)
  const { name, type } = path.slice(-1)[0]
  return <PageHeader
    {...props}
    subTitle={<Loader states={[state]} fallback={<Spinner size='small' />}>
      {useSubTitle(results.data?.subTitle || [], type)}
    </Loader>}
    title={<Loader states={[state]} fallback={<Spinner size='default' />}>
      {type !== 'network' ?
        results.data?.name || getVenueName(name, filterResult?.data)
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
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
      />
    ]}
  />
}
