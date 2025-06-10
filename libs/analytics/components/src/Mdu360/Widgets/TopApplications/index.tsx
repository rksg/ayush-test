import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { ContentSwitcher, Card, Loader, NoData, GridRow, GridCol } from '@acx-ui/components'

import { useTopNApplicationQuery } from './services'

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

  const results = queryResults?.data

  const title = $t({ defaultMessage: 'Top 10 Applications' })

  return (
    <Loader states={[queryResults]}>
      <Card type='default' title={title}>
        {results ? (
          <>
            <div style={{ marginTop: -38 }}>
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
            </div>
            <div>
              <GridRow>
                <GridCol col={{ span: 12 }}>
                  Application1
                </GridCol>
                <GridCol col={{ span: 12 }}>
                  Application2
                </GridCol>
              </GridRow>
            </div>
          </>
        ) : (
          <NoData />
        )}
      </Card>
    </Loader>
  )
}
