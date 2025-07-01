import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  DonutChart,
  ContentSwitcher,
  Loader,
  ContentSwitcherProps,
  HistoricalCard,
  NoData
} from '@acx-ui/components'
import { formats } from '@acx-ui/formatter'

import { ContentSwitcherWrapper } from '../../styledComponents'

import { useTopNApplicationCategoriesQuery } from './services'

export interface ApplicationCategoriesFilters {
  startDate: string;
  endDate: string;
}

export const ApplicationCategories = ({
  filters
}: {
  filters: ApplicationCategoriesFilters;
}) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNApplicationCategoriesQuery({
    // TODO: replace this with the path when provided by ResidentExperienceTab
    path: [{ type: 'network', name: 'Network' }],
    start,
    end,
    n: 10
  })
  const results = queryResults?.data
  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Client Count' }),
        value: 'clientCount',
        children:
          <AutoSizer>
            {({ height, width }) => (
              results?.clientCount.length ?
                <DonutChart
                  data={results.clientCount}
                  style={{ width, height }}
                  legend='name-bold-value'
                  size='medium'
                  showLegend
                  showTotal
                  showValue
                  showLabel
                /> : <NoData />
            )}
          </AutoSizer>
      },
      {
        label: $t({ defaultMessage: 'Data Usage' }),
        value: 'dataUsage',
        children:
          <AutoSizer>
            {({ height, width }) => (
              results?.dataUsage.length ?
                <DonutChart
                  data={results.dataUsage}
                  style={{ width, height }}
                  legend='name-bold-value'
                  size='medium'
                  showLegend
                  showTotal
                  showValue
                  showLabel
                  dataFormatter={(value) => formats.bytesFormat(value as number)}
                /> : <NoData />
            )}
          </AutoSizer>
      }
    ],
    [$t, results?.clientCount, results?.dataUsage]
  )

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard
        title={$t({ defaultMessage: 'Top 10 Application Categories' })}
      >
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher
                tabDetails={tabDetails}
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
