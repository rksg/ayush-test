import { useState } from 'react'

import { useIntl } from 'react-intl'

import { isSwitchPath } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps }        from '@acx-ui/components'
import { get }                                                       from '@acx-ui/config'
import { DateFormatEnum, formatter }                                 from '@acx-ui/formatter'
import { filterByAccess, getShowWithoutRbacCheckKey, hasPermission } from '@acx-ui/user'
import { noDataDisplay, PathFilter }                                 from '@acx-ui/utils'

import {
  useIntentAIListQuery,
  IntentListItem
} from './services'
import * as UI                from './styledComponents'
import { useIntentAIActions } from './useIntentAIActions'

export function IntentAITable (
  { pathFilters }: { pathFilters: PathFilter }
) {
  const { $t } = useIntl()
  const intentActions = useIntentAIActions()

  const switchPath = isSwitchPath(pathFilters.path)
  const queryResults = useIntentAIListQuery(
    { ...pathFilters },
    { skip: switchPath }
  )
  const data = switchPath ? [] : queryResults?.data

  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const rowActions: TableProps<IntentListItem>['rowActions'] = [
    {
      key: getShowWithoutRbacCheckKey('1-click-optimize'),
      label: $t({ defaultMessage: '1-Click Optimize' }),
      visible: (rows) => rows?.filter(row =>
        row.status !== 'new' ||
        !(row.code.startsWith('c-probeflex-') || row.code.startsWith('c-crrm'))).length === 0,
      onClick: async (rows) => {
        intentActions.showOneClickOptimize(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<IntentListItem>['columns'] = [
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

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  return (
    <Loader states={[queryResults]}>
      <UI.IntentAITableWrapper
        data-testid='intentAI'
        settingsId={'intentai-table'}
        type='tall'
        dataSource={data}
        columns={columns}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasPermission({ permission: 'WRITE_INCIDENTS' }) && {
          type: 'checkbox',
          selectedRowKeys
        }}
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        filterableWidth={155}
        searchableWidth={240}
      />
    </Loader>
  )
}