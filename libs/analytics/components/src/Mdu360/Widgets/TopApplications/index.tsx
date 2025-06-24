import { useMemo } from 'react'

import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { ContentSwitcher, Loader, NoData, HistoricalCard, ContentSwitcherProps } from '@acx-ui/components'
import { formats }                                                               from '@acx-ui/formatter'

import { useTopNApplicationsQuery } from './services'
import * as UI                      from './styledComponents'
import { IconList }                 from './utils'

interface TopApplicationsFilters {
  startDate: string;
  endDate: string;
}

interface ApplicationData {
  name: string;
  value: number;
}

type TabType = 'clientCount' | 'applicationTraffic'

const COLUMN_SIZE = 5

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

  const clientData: ApplicationData[] = useMemo(() =>
    results?.topNApplicationByClient?.map(item => ({
      name: item.name,
      value: item.clientCount
    })) || [], [results?.topNApplicationByClient]
  )

  const trafficData: ApplicationData[] = useMemo(() =>
    results?.topNApplicationByTraffic?.map(item => ({
      name: item.name,
      value: item.applicationTraffic
    })) || [], [results?.topNApplicationByTraffic]
  )

  const formatValue = (value: number, currentTab: TabType): string =>
    currentTab === 'applicationTraffic'
      ? formats.bytesFormat(value)
      : value.toString()

  const getIconForApplication = (name: string) => {
    return IconList.find(icon => name.toLowerCase().includes(icon.name))?.icon ||
      IconList.find(icon => icon.name === 'chrome')?.icon
  }

  const renderApplicationItem = (item: ApplicationData, currentTab: TabType) => {
    const { name, value } = item
    const icon = getIconForApplication(name)

    return (
      <UI.ColumnItemWrapper key={name}>
        <UI.ColumnItemIconWrapper>
          {icon}
          <span>{name}</span>
        </UI.ColumnItemIconWrapper>
        <UI.ColumnValue>{formatValue(value, currentTab)}</UI.ColumnValue>
      </UI.ColumnItemWrapper>
    )
  }

  const renderColumn = (items: ApplicationData[], currentTab: TabType) => (
    <UI.ColumnHeaderWrapper>
      {items.map(item => renderApplicationItem(item, currentTab))}
    </UI.ColumnHeaderWrapper>
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderContent = (data: ApplicationData[], currentTab: TabType) => {
    const leftColumn = data.slice(0, COLUMN_SIZE)
    const rightColumn = data.slice(COLUMN_SIZE)

    return (
      <UI.ColumnWrapper>
        {renderColumn(leftColumn, currentTab)}
        <Divider
          type='vertical'
          style={{ height: '135px', marginInline: 16 }}
        />
        {renderColumn(rightColumn, currentTab)}
      </UI.ColumnWrapper>
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
    <Loader states={[queryResults]}>
      <HistoricalCard title={title}>
        <UI.ContentSwitcherWrapper>
          <ContentSwitcher
            tabDetails={tabDetails}
            size='small'
            align='right'
          />
        </UI.ContentSwitcherWrapper>
      </HistoricalCard>
    </Loader>
  )
}
