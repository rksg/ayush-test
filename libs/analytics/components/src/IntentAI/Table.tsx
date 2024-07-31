import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Loader, TableProps, Table, Tooltip }             from '@acx-ui/components'
import { get }                                            from '@acx-ui/config'
import { DateFormatEnum, formatter }                      from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI } from '@acx-ui/icons'
import { noDataDisplay, PathFilter }                      from '@acx-ui/utils'

import { codes }                                 from './config'
import { useIntentAITableQuery, IntentListItem } from './services'
import * as UI                                   from './styledComponents'

const icons = {
  'AI-Driven RRM': <AIDrivenRRM />,
  'AirFlexAI': <AirFlexAI />,
  'AI Operations': <AIOperation />,
  'EcoFlexAI': <EcoFlexAI />
}

export function IntentAITable (
  { pathFilters }: { pathFilters: PathFilter }
) {
  const { $t } = useIntl()

  const {
    tableQuery: queryResults,
    onFilterChange,
    onPageChange,
    pagination,
    filterOptions
  } = useIntentAITableQuery(
    { ...pathFilters }
  )
  const { aiFeatures = [], categories =[], statuses = [], zones = [] } = filterOptions?.data || {}
  const data = queryResults?.data?.intents
  const columns: TableProps<IntentListItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'AI Feature' }),
      width: 110,
      dataIndex: 'aiFeature',
      key: 'aiFeature',
      filterable: aiFeatures,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All AI Features' }),
      render: (_: ReactNode, row: IntentListItem) => <UI.FeatureIcon>
        {icons[codes[row.code].aiFeature]}
        <span>{row.aiFeature}</span>
      </UI.FeatureIcon>
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
      key: 'category',
      filterable: categories,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Categories' })
    },
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      width: 200,
      dataIndex: 'sliceValue',
      key: 'sliceValue',
      filterable: zones,
      filterSearch: true,
      filterPlaceholder: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'All Zones' })
        : $t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }),
      render: (_, row: IntentListItem ) => {
        return <Tooltip
          placement='top'
          title={row.scope}
          dottedUnderline={true}
        >
          {row.sliceValue}
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      width: 200,
      dataIndex: 'status',
      key: 'status',
      filterable: statuses,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Status' }),
      render: (_, row: IntentListItem ) => {
        const { status, statusTooltip } = row
        return <Tooltip
          placement='top'
          title={statusTooltip}
          dottedUnderline={true}
        >
          {status}
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Last update' }),
      width: 130,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, row) => formatter(DateFormatEnum.DateTimeFormat)(row.updatedAt)
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <UI.IntentAITableStyle/>
      <Table
        className='intentai-table'
        data-testid='intentAI'
        settingsId={'intentai-table'}
        type='tall'
        dataSource={data}
        columns={columns}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        filterableWidth={200}
        onChange={onPageChange}
        pagination={{ ...pagination, total: queryResults?.data?.total || 0 }}
        onFilterChange={onFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}