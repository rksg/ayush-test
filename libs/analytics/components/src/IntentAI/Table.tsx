import { useIntl } from 'react-intl'

import { isSwitchPath } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps }        from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { noDataDisplay, PathFilter } from '@acx-ui/utils'

import {
  useIntentAIRecommendationListQuery,
  IntentAIRecommendationListItem
} from './services'
import * as UI from './styledComponents'

export function IntentAIRecommendationTable (
  { pathFilters }: { pathFilters: PathFilter }
) {
  const { $t } = useIntl()

  const switchPath = isSwitchPath(pathFilters.path)
  const queryResults = useIntentAIRecommendationListQuery(
    { ...pathFilters },
    { skip: switchPath }
  )
  const data = switchPath ? [] : queryResults?.data

  const columns: TableProps<IntentAIRecommendationListItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'AI Feature' }),
      width: 110,
      dataIndex: 'aiFeature',
      key: 'aiFeature'
    },
    {
      title: $t({ defaultMessage: 'Intent' }),
      width: 250,
      dataIndex: 'intent',
      key: 'intent'
    },
    {
      title: $t({ defaultMessage: 'Category' }),
      width: 130,
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      width: 200,
      dataIndex: 'sliceValue',
      key: 'sliceValue'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      width: 90,
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: $t({ defaultMessage: 'Last update' }),
      width: 130,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, record) => formatter(DateFormatEnum.DateTimeFormat)(record.updatedAt)
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <UI.IntentAITableWrapper
        data-testid='intentAI'
        settingsId={'intentai-table'}
        type='tall'
        dataSource={data}
        columns={columns}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        filterableWidth={155}
        searchableWidth={240}
      />
    </Loader>
  )
}