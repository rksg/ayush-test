import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  ContentSwitcher,
  DonutChart,
  HistoricalCard,
  Loader,
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

  const getTabDetails = (height: number, width: number) => [
    {
      label: $t({ defaultMessage: 'Client Count' }),
      value: 'clientCount',
      children: results?.clientCount.length ? (
        <DonutChart
          data={results.clientCount}
          style={{ width, height }}
          legend='name-bold-value'
          size='large'
          showLegend
          showTotal
          showValue
          showLabel
        />
      ) : (
        <NoData />
      )
    },
    {
      label: $t({ defaultMessage: 'Data Usage' }),
      value: 'dataUsage',
      children: results?.dataUsage.length ? (
        <DonutChart
          data={results.dataUsage}
          style={{ width, height }}
          legend='name-bold-value'
          size='large'
          showLegend
          showTotal
          showValue
          showLabel
          dataFormatter={(value) =>
            formats.bytesFormat(value as number)}
        />
      ) : (
        <NoData />
      )
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard
        title={$t({ defaultMessage: 'Top 10 Application Categories' })}
      >
        <AutoSizer>
          {({ height, width }) => (
            <ContentSwitcherWrapper height={height} width={width}>
              <ContentSwitcher
                tabDetails={getTabDetails}
                align='right'
                size='small'
                height={height}
                width={width}
              />
            </ContentSwitcherWrapper>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
