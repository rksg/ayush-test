import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  ContentSwitcher } from '@acx-ui/components'

import { ContentSwitcherWrapper } from '../../styledComponents'
import { Mdu360TabProps }         from '../../types'

import { useTrafficByRadioQuery } from './services'
import { TrafficSnapshot }        from './TrafficSnapshot'
import { TrafficTrend }           from './TrafficTrend'

export interface TrafficByRadioFilters {
  startDate: string,
  endDate: string
}

export function TrafficByRadio ({ filters }: { filters: Mdu360TabProps }) {
  const { $t } = useIntl()

  const queryResults = useTrafficByRadioQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    startDate: filters.startDate,
    endDate: filters.endDate
  })

  const getTabDetails = (height: number, width: number) => [
    {
      label: $t({ defaultMessage: 'Snapshot' }),
      value: 'Snapshot',
      children: (
        <TrafficSnapshot
          queryResults={queryResults}
          height={height}
          width={width}
        />
      )
    },
    {
      label: $t({ defaultMessage: 'Trend' }),
      value: 'Trend',
      children: (
        <TrafficTrend
          queryResults={queryResults}
          height={height}
          width={width}
        />
      )
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic By Radio' })}>
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher
                tabDetails={getTabDetails(height - 10, width)}
                align='right'
                size='small'
              />
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}