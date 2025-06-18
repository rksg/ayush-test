import { useMemo, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  DonutChart,
  ContentSwitcher,
  Card,
  Loader,
  NoData,
  ContentSwitcherProps
} from '@acx-ui/components'
import { formats } from '@acx-ui/formatter'

import {
  ApplicationCategoriesData,
  useTopNApplicationCategoriesQuery
} from './services'

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
  const [selectedTab, setSelectedTab] =
    useState<keyof ApplicationCategoriesData>('clientCount')

  const { startDate: start, endDate: end } = filters
  const queryResults = useTopNApplicationCategoriesQuery({
    // TODO: replace this with the path when provided by ResidentExperienceTab
    path: [{ type: 'network', name: 'Network' }],
    start,
    end,
    n: 10
  })
  const results = queryResults?.data
  const chartData = results?.[selectedTab]
  const title = $t({ defaultMessage: 'Top 10 Application Categories' })
  const tabDetails: ContentSwitcherProps['tabDetails'] = useMemo(
    () => [
      {
        label: $t({ defaultMessage: 'Client Count' }),
        value: 'clientCount',
        children: null
      },
      {
        label: $t({ defaultMessage: 'Data Usage' }),
        value: 'dataUsage',
        children: null
      }
    ],
    [$t]
  )

  return (
    <Loader states={[queryResults]}>
      <Card
        title={title}
        extra={
          <ContentSwitcher
            tabDetails={tabDetails}
            value={selectedTab}
            onChange={(value) =>
              setSelectedTab(value as keyof ApplicationCategoriesData)
            }
            size='small'
            align='center'
            style={{ padding: 0 }}
            noPadding
          />
        }
      >
        {chartData?.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <DonutChart
                data={chartData}
                style={{ width, height }}
                legend='name-bold-value'
                size='medium'
                showLegend
                showTotal
                showValue
                showLabel
                {...(selectedTab === 'dataUsage' && {
                  dataFormatter: (value) =>
                    formats.bytesFormat(value as number)
                })}
              />
            )}
          </AutoSizer>
        ) : (
          <NoData />
        )}
      </Card>
    </Loader>
  )
}
