import { useMemo } from 'react'

import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { ContentSwitcher, Loader, NoData, HistoricalCard, ContentSwitcherProps } from '@acx-ui/components'
import { formats }                                                               from '@acx-ui/formatter'

import * as UI from '../styledComponents'

import { useTopNApplicationsQuery } from './services'
import { IconList }                 from './utils'

interface TopApplicationsFilters {
  startDate: string;
  endDate: string;
}

export const TopApplications = ({ filters }: { filters: TopApplicationsFilters }) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNApplicationsQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    start,
    end,
    n: 10
  })

  const results = queryResults?.data

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clientData =
  results?.topNApplicationByClient?.map(item => ({
    name: item.name,
    value: item.clientCount
  })) || []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trafficData =
  results?.topNApplicationByTraffic?.map(item => ({
    name: item.name,
    value: item.applicationTraffic
  })) || []

  const formatValue = (value: number, currentTab: 'clientCount' | 'applicationTraffic') =>
    currentTab === 'applicationTraffic'
      ? formats.bytesFormat(value)
      : value

  const getColumns = (
    data: typeof clientData | typeof trafficData
  ): [typeof data, typeof data] => {
    return [data.slice(0, 5), data.slice(5)]
  }

  const renderColumn = (
    items: typeof clientData | typeof trafficData,
    currentTab: 'clientCount' | 'applicationTraffic'
  ) => (
    <UI.ColumnHeaderWrapper>
      {items.map(({ name, value }) => {
        const icon =
        IconList.find(icon => name.toLowerCase().includes(icon.name))?.icon ||
        IconList.find(icon => icon.name === 'chrome')?.icon

        return (
          <UI.ColumnItemWrapper key={name}>
            <UI.ColumnItemIconWrapper>
              {icon}
              <span>{name}</span>
            </UI.ColumnItemIconWrapper>
            <UI.ColumnValue>{formatValue(value, currentTab)}</UI.ColumnValue>
            {/* <span><b>{formatValue(value, currentTab)}</b></span> */}
          </UI.ColumnItemWrapper>
        )
      })}
    </UI.ColumnHeaderWrapper>
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderContent = (
    data: typeof clientData | typeof trafficData,
    currentTab: 'clientCount' | 'applicationTraffic'
  ) => {
    const [leftColumn, rightColumn] = getColumns(data)

    return (
      <Loader states={[queryResults]}>
        <UI.ColumnWrapper>
          {renderColumn(leftColumn, currentTab)}
          <Divider
            type='vertical'
            style={{ height: '135px', marginInline: 16 }}
          />
          {renderColumn(rightColumn, currentTab)}
        </UI.ColumnWrapper>
      </Loader>
    )
  }

  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Client Count' }),
        value: 'clientCount',
        children: clientData.length > 0 ? renderContent(clientData, 'clientCount') : <NoData />
      },
      {
        label: $t({ defaultMessage: 'Data Usage' }),
        value: 'applicationTraffic',
        children: trafficData.length > 0
          ? renderContent(trafficData, 'applicationTraffic')
          : <NoData />
      }
    ],
    [$t, clientData, trafficData, renderContent]
  )

  const title = $t({ defaultMessage: 'Top 10 Applications' })

  return (
    <HistoricalCard title={title}>
      <UI.ContentSwitcherWrapper>
        <ContentSwitcher
          tabDetails={tabDetails}
          size='small'
          align='right'
          // noPadding
        />
      </UI.ContentSwitcherWrapper>
    </HistoricalCard>
  )
}
