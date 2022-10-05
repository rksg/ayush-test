import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import {  nodeTypes, useAnalyticsFilter }                   from '@acx-ui/analytics/utils'
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
  title: string
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & {
  data: HeaderData
  replaceTitle: boolean,
  shouldQuerySwitch: boolean,
  venueTitle? : string | null
}

export const useSubTitle = (subTitles: SubTitle[]) => {
  const { $t } = useIntl()
  return (
    <>
      {subTitles.map(({ key, value }, index) => {
        const labelKey = key as keyof typeof labelMap
        const content = key === 'type'
          ? $t(nodeTypes(value[0] as NodeType))
          : value.length > 1
            ? `${value[0]} (${value.length})`
            : `${value[0]}`
        return (
          <span key={key} title={key === 'type' ? content : value.join(', ')}>
            {$t(labelMap[labelKey])} {content}
            {index < subTitles.length - 1 && <Divider key={key} type='vertical' />}
          </span>
        )
      })}
    </>
  )
}

export const Header = ({
  data,
  replaceTitle,
  shouldQuerySwitch,
  venueTitle,
  ...otherProps
}: HeaderProps) => {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  const { title, subTitle } = data
  const props = { ...otherProps, subTitle: useSubTitle(subTitle) }
  if (replaceTitle) props.title = venueTitle ? venueTitle : title
  return (
    <PageHeader
      {...props}
      extra={[
        <NetworkFilter
          key='network-filter'
          shouldQuerySwitch={shouldQuerySwitch}
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
  )
}

const ConnectedHeader = (props: PageHeaderProps & { shouldQuerySwitch : boolean }) => {
  const { filters } = useAnalyticsFilter()
  const queryResults = useNetworkNodeInfoQuery(filters)
  const isVenue = !!(
    filters?.filter?.networkNodes?.[0]?.length &&
    filters?.filter?.networkNodes?.[0]?.length === 1
  )
  const replaceTitle = filters.path.length > 1 || isVenue
  const venueTitle = isVenue
    ? filters?.filter?.networkNodes?.[0][0]?.name
    : null
  return (
    <ConnectedHeaderWrapper>
      <Loader states={[queryResults]}>
        <Header
          {...props}
          shouldQuerySwitch={props.shouldQuerySwitch}
          data={queryResults.data as HeaderData}
          replaceTitle={replaceTitle}
          venueTitle={venueTitle}
        />
      </Loader>
    </ConnectedHeaderWrapper>
  )
}

export default ConnectedHeader
