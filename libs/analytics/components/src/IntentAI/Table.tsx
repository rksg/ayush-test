import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Loader, TableProps, Table }                      from '@acx-ui/components'
import { get }                                            from '@acx-ui/config'
import { DateFormatEnum, formatter }                      from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI } from '@acx-ui/icons'
import { noDataDisplay, PathFilter }                      from '@acx-ui/utils'

import { codes }                                from './config'
import { useInentAITableQuery, IntentListItem, useIntentFilterOptionsQuery } from './services'
import * as UI                                  from './styledComponents'

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
  } = useInentAITableQuery(
    { ...pathFilters }
  )
  const {aiFeatures = [], categories =[], statuses = [], zones = []} = filterOptions.data! || {}
  console.log(zones)
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
        : $t({ defaultMessage: 'All <VenuePlural></VenuePlural>' })
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      width: 200,
      dataIndex: 'status',
      key: 'status',
      filterable: statuses,
      filterSearch: true,
      filterPlaceholder: $t({ defaultMessage: 'All Status' })
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
        filterableWidth={155}
        searchableWidth={240}
        onChange={onPageChange}
        pagination={{ ...pagination, total: queryResults?.data?.total || 0 }}
        onFilterChange={onFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}