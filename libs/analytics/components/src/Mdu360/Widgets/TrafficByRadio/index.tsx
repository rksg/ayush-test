import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  ContentSwitcherProps,
  ContentSwitcher } from '@acx-ui/components'

import { ContentSwitcherWrapper } from '../../styledComponents'

import { useTrafficByRadioQuery } from './services'
import { TrafficSnapshot }        from './TrafficSnapshot'
import { TrafficTrend }           from './TrafficTrend'

export interface TrafficByRadioFilters {
  startDate: string,
  endDate: string
}

export function TrafficByRadio ({ filters }: { filters: TrafficByRadioFilters }) {
  const { $t } = useIntl()

  const queryResults = useTrafficByRadioQuery({
    path: [{ type: 'network', name: 'Network' }], // replace this with the path when provided by ResidentExperienceTab
    startDate: filters.startDate,
    endDate: filters.endDate
  })

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t({ defaultMessage: 'Snapshot' }),
      children: <TrafficSnapshot queryResults={queryResults}/>,
      value: 'Snapshot'
    },
    {
      label: $t({ defaultMessage: 'Trend' }),
      children: <TrafficTrend queryResults={queryResults}/>,
      value: 'Trend'
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic By Radio' })}>
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher tabDetails={tabDetails} align='right' size='small' />
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}