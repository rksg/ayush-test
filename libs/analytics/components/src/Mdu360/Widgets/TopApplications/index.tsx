import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { ContentSwitcher, Loader, NoData, HistoricalCard, ContentSwitcherProps } from '@acx-ui/components'
import { formats }                                                               from '@acx-ui/formatter'

import { ContentSwitcherWrapper } from '../../styledComponents'
import { Mdu360TabProps }         from '../../types'

import { useMduTopNApplicationsQuery }       from './services'
import { ApplicationData, renderContent } from './utils'


export const TopApplications = ({ filters }: { filters: Mdu360TabProps }) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end } = filters
  const queryResults = useMduTopNApplicationsQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    start,
    end,
    n: 10
  })
  const results = queryResults?.data

  const clientData: ApplicationData[] = useMemo(() =>
    results?.topNApplicationByClient?.map(item => ({
      name: item.name,
      value: (item.clientCount).toString()
    })) || [], [results?.topNApplicationByClient]
  )

  const trafficData: ApplicationData[] = useMemo(() =>
    results?.topNApplicationByTraffic?.map(item => ({
      name: item.name,
      value: formats.bytesFormat(item.applicationTraffic)
    })) || [], [results?.topNApplicationByTraffic]
  )

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Client Count' }),
      value: 'clientCount',
      children: clientData.length > 0 ? renderContent(clientData) : <NoData />
    },
    {
      label: $t({ defaultMessage: 'Data Usage' }),
      value: 'applicationTraffic',
      children: trafficData.length > 0
        ? renderContent(trafficData)
        : <NoData />
    }
  ]

  const title = $t({ defaultMessage: 'Top 10 Applications' })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={title}>
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper
              height={height}
              width={width}
              style={{ paddingBottom: 30 }}
            >
              <ContentSwitcher
                tabDetails={tabDetails}
                size='small'
                align='right'
              />
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
