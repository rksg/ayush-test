import { useState } from 'react'

import { useIntl } from 'react-intl'

import { ContentSwitcher, Card, Loader, NoData, GridRow } from '@acx-ui/components'
import { formats }                                        from '@acx-ui/formatter'

import * as UI from '../styledComponents'

import { useTopNApplicationsQuery } from './services'
import { IconList }                 from './utils'

interface TopApplicationsFilters {
  startDate: string;
  endDate: string;
}

export const TopApplications = ({ filters }: { filters: TopApplicationsFilters }) => {
  const { $t } = useIntl()
  const [selectedTab, setSelectedTab] = useState<
    'clientCount' | 'applicationTraffic'
  >('clientCount')
  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNApplicationsQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    start,
    end,
    n: 10
  })

  const tabDetails = [
    { label: $t({ defaultMessage: 'Client Count' }), value: 'clientCount', children: null },
    { label: $t({ defaultMessage: 'Data Usage' }), value: 'applicationTraffic', children: null }
  ]

  const results = queryResults?.data

  const data = selectedTab === 'clientCount'
    ? results?.topNApplicationByClient?.map((item) => ({
      name: item.name,
      value: item.clientCount
    })) || []
    : results?.topNApplicationByTraffic?.map((item) => ({
      name: item.name,
      value: item.applicationTraffic
    })) || []

  const mid = Math.ceil(data.length / 2)
  const leftColumn = data.slice(0, mid)
  const rightColumn = data.slice(mid)

  const formatValue = (value: number) => {
    return selectedTab === 'applicationTraffic'
      ? formats.bytesFormat(value)
      : value
  }

  const renderColumn = (items: typeof data) => (
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
            <span><b>{formatValue(value)}</b></span>
          </UI.ColumnItemWrapper>
        )
      })}
    </UI.ColumnHeaderWrapper>
  )

  const title = $t({ defaultMessage: 'Top 10 Applications' })

  return (
    <Loader states={[queryResults]}>
      <Card type='default' title={title}>
        <UI.ContentSwitcherWrapper>
          <ContentSwitcher
            tabDetails={tabDetails}
            value={selectedTab}
            onChange={(value) => setSelectedTab(value as 'clientCount' | 'applicationTraffic')}
            size='small'
            align='right'
            noPadding
          />
        </UI.ContentSwitcherWrapper>
        {data.length > 0 ? (
          <GridRow>
            <UI.LeftColumnWrapper col={{ span: 12 }}>
              {renderColumn(leftColumn)}
            </UI.LeftColumnWrapper>
            <UI.RightColumnWrapper col={{ span: 12 }}>
              {renderColumn(rightColumn)}
            </UI.RightColumnWrapper>
          </GridRow>
        ) : (
          <NoData />
        )}
      </Card>
    </Loader>
  )
}
