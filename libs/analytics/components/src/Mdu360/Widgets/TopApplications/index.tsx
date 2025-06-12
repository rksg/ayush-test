import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { ContentSwitcher, Card, Loader, NoData, GridRow } from '@acx-ui/components'

import * as UI from '../styledComponents'

import { useTopNApplicationQuery } from './services'
import { IconList, formatBytes }   from './utils'

interface TopApplicationsFilters {
  startDate: string;
  endDate: string;
}

const tabDetails = [
  { label: 'Client Count', value: 'clientCount' },
  { label: 'Data Usage', value: 'applicationTraffic' }
]

export const TopApplications = ({ filters }: { filters: TopApplicationsFilters }) => {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const [selectedTab, setSelectedTab] = useState<'clientCount' | 'applicationTraffic'>('clientCount')

  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNApplicationQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    start,
    end,
    n: 10
  })

  // const results = queryResults?.data

  // const results = {
  //   topNApplicationByClient: [
  //     {
  //       applicationTraffic: 16184,
  //       clientCount: 4,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 5093,
  //       clientCount: 3,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 2059164,
  //       clientCount: 3,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 131222,
  //       clientCount: 2,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 2190550,
  //       clientCount: 2,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 9157432,
  //       clientCount: 2,
  //       name: 'Facebook'
  //     },
  //     {
  //       applicationTraffic: 316055,
  //       clientCount: 2,
  //       name: 'Facebook'
  //     }
  //     // {
  //     //   applicationTraffic: 1627108,
  //     //   clientCount: 2,
  //     //   name: 'Facebook'
  //     // },
  //     // {
  //     //   applicationTraffic: 115551,
  //     //   clientCount: 2,
  //     //   name: 'Facebook'
  //     // },
  //     // {
  //     //   applicationTraffic: 5235759,
  //     //   clientCount: 2,
  //     //   name: 'Facebook'
  //     // }
  //   ]
  // }
  const results = {
    topNApplicationByClient: [
      {
        applicationTraffic: 16184,
        clientCount: 4,
        name: 'Facebook'
      },
      {
        applicationTraffic: 5093,
        clientCount: 3,
        name: 'Twitter'
      }
      // {
      //   applicationTraffic: 2059164,
      //   clientCount: 3,
      //   name: 'Google'
      // },
      // {
      //   applicationTraffic: 131222,
      //   clientCount: 2,
      //   name: 'Whatsapp'
      // },
      // {
      //   applicationTraffic: 2190550,
      //   clientCount: 2,
      //   name: 'YouTube'
      // },
      // {
      //   applicationTraffic: 9157432,
      //   clientCount: 2,
      //   name: 'Netflix'
      // },
      // {
      //   applicationTraffic: 316055,
      //   clientCount: 2,
      //   name: 'apple_location'
      // },
      // {
      //   applicationTraffic: 1627108,
      //   clientCount: 2,
      //   name: 'apple_update'
      // },
      // {
      //   applicationTraffic: 115551,
      //   clientCount: 2,
      //   name: 'chrome_update'
      // },
      // {
      //   applicationTraffic: 5235759,
      //   clientCount: 2,
      //   name: 'dns'
      // }
    ]
  }

  const data = results.topNApplicationByClient
    .map(item => ({
      name: item.name,
      value: item[selectedTab]
    }))
    .sort((a, b) => b.value - a.value)

  const mid = Math.ceil(data.length / 2)
  const leftColumn = data.slice(0, mid)
  const rightColumn = data.slice(mid)

  const formatValue = (value: number) => {
    return selectedTab === 'applicationTraffic'
      ? formatBytes(value)
      : value
  }

  const renderColumn = (items: typeof data) => (
    <UI.ColumnHeaderWrapper>
      {items.map(({ name, value }) => (
        <UI.ColumnItemWrapper key={name}>
          <div>
            {IconList.find(icon => icon.name === name)?.icon}
            <span>{name}</span>
          </div>
          <span><b>{formatValue(value)}</b></span>
        </UI.ColumnItemWrapper>
      ))}
    </UI.ColumnHeaderWrapper>
  )

  const title = $t({ defaultMessage: 'Top 10 Applications' })

  return (
    <Loader states={[queryResults]}>
      <Card type='default' title={title}>
        {results ? (
          <>
            <UI.ContentSwitcherWrapper>
              <ContentSwitcher
                tabDetails={tabDetails.map(({ label, value }) => ({
                  label,
                  value,
                  children: null
                }))}
                value={selectedTab}
                onChange={(value) => setSelectedTab(value as 'clientCount' | 'applicationTraffic')}
                size='small'
                align='right'
                noPadding
              />
            </UI.ContentSwitcherWrapper>
            <GridRow>
              <UI.LeftColumnWrapper col={{ span: 12 }}>
                {renderColumn(leftColumn)}
              </UI.LeftColumnWrapper>
              <UI.RightColumnWrapper col={{ span: 12 }}>
                {renderColumn(rightColumn)}
              </UI.RightColumnWrapper>
            </GridRow>
          </>
        ) : (
          <NoData />
        )}
      </Card>
    </Loader>
  )
}
