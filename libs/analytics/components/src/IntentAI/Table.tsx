import { Typography }                from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { isSwitchPath } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Tooltip }        from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { TenantLink }                from '@acx-ui/react-router-dom'
import { noDataDisplay, PathFilter } from '@acx-ui/utils'

import {
  useIntentAIRecommendationListQuery,
  IntentAIRecommendationListItem
} from './services'
import * as UI from './styledComponents'


const Link = (
  { text, to, disabled }: { text: string, to: string, disabled: boolean }
) => {
  return disabled
    ? <Tooltip
      title={<FormattedMessage defaultMessage='Not available' />}
      children={<Typography.Text disabled children={text} />}
    />
    : <TenantLink to={to} children={text} />
}

const DateLink = (
  { value }: { value: IntentAIRecommendationListItem }
) => {
  const { updatedAt } = value
  const text = formatter(DateFormatEnum.DateTimeFormat)(updatedAt)
  return <Link
    disabled={false}
    text={text}
    to={'TBD'}
  />
}

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
      render: (_, value) => <DateLink
        value={value}
      />
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