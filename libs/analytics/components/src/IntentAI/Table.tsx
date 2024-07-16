import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import { Loader, TableProps, Table }                      from '@acx-ui/components'
import { get }                                            from '@acx-ui/config'
import { DateFormatEnum, formatter }                      from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI, EcoFlexAI } from '@acx-ui/icons'
import { noDataDisplay, PathFilter }                      from '@acx-ui/utils'

import { codes }                                from './config'
import { useIntentAIListQuery, IntentListItem } from './services'
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

  const queryResults = useIntentAIListQuery(
    { ...pathFilters }
  )
  const data = queryResults?.data
  const columns: TableProps<IntentListItem>['columns'] = [
    {
      title: $t({ defaultMessage: 'AI Feature' }),
      width: 110,
      dataIndex: 'aiFeature',
      key: 'aiFeature',
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
      width: 200,
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
      />
    </Loader>
  )
}