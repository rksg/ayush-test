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
import { Mdu360TabProps }         from '../../types'

import { useTopNApplicationCategoriesQuery } from './services'

export const ApplicationCategories = ({
  filters
}: {
  filters: Mdu360TabProps;
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
  // const results = {
  //   clientCount: [
  //     { name: 'Application Service', value: 6 },
  //     { name: 'Unknown', value: 6 },
  //     { name: 'Web', value: 6 },
  //     { name: 'Instant Messaging', value: 4 },
  //     { name: 'Network Management', value: 4 },
  //     { name: 'Network Service', value: 4 },
  //     { name: 'Webmail', value: 2 },
  //     { name: 'Education', value: 20 },
  //     { name: 'Medicine', value: 5 },
  //     { name: 'Transportation', value: 12 }
  //   ],
  //   dataUsage: [
  //     { name: 'Application Service', value: 24605875 },
  //     { name: 'Unknown', value: 735023714 },
  //     { name: 'Web', value: 25794416527 },
  //     { name: 'Instant Messaging', value: 833554 },
  //     { name: 'Network Management', value: 6574 },
  //     { name: 'Network Service', value: 540313 },
  //     { name: 'Webmail', value: 1010014 },
  //     { name: 'Education', value: 310014112 },
  //     { name: 'Medicine', value: 10100140 },
  //     { name: 'Transportation', value: 4400000 }
  //   ]
  // }
  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Client Count' }),
        value: 'clientCount',
        children: results?.clientCount.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <DonutChart
                data={results.clientCount}
                style={{ width, height }}
                legend='name-bold-value'
                size='medium'
                showLegend
                showTotal
                showValue
                showLabel
              />
            )}
          </AutoSizer>
        ) : (
          <NoData />
        )
      },
      {
        label: $t({ defaultMessage: 'Data Usage' }),
        value: 'dataUsage',
        children: results?.dataUsage.length ? (
          <AutoSizer>
            {({ height, width }) => (
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
              />
            )}
          </AutoSizer>
        ) : (
          <NoData />
        )
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
