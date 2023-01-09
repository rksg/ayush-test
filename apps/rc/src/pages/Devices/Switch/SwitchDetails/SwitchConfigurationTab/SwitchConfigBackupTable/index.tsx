/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, Descriptions }    from '@acx-ui/components'
import { useGetSwitchConfigBackupListQuery }                            from '@acx-ui/rc/services'
import { ConfigurationHistory, DispatchFailedReason, useTableQuery } from '@acx-ui/rc/utils'

import * as UI         from './styledComponents'

export function SwitchConfigBackupTable () {
  const { $t } = useIntl()
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const [visible, setVisible] = useState(false)
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([] as DispatchFailedReason[])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)

  const showModal = (row: ConfigurationHistory) => {
    setSelectedRow(row)
    setDispatchFailedReason(row.dispatchFailedReason as DispatchFailedReason[] || [])
    setCollapseActive(!row?.dispatchFailedReason?.length)
    setShowClis(!!row?.clis)
    setShowError(!!row?.clis || !!row?.dispatchFailedReason?.length)
    setVisible(true)
  }

  const handleCancel = () => {
    setDispatchFailedReason([])
    setVisible(false)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchConfigBackupListQuery,
    defaultPayload: {}
  })

  const tableData = tableQuery.data?.data ?? []

  const columns: TableProps<ConfigurationHistory>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    disable: true
  }, {
    key: 'createdDate',
    title: $t({ defaultMessage: 'Date' }),
    dataIndex: 'createdDate'
  }, {
    key: 'backupType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'backupType'
  }, {
    key: 'status',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'status'
  }
  ]

  const isActionVisible = (
    selectedRows: any[],
    { selectOne }: { selectOne?: boolean }) => {
    return !!selectOne && selectedRows.length === 1
  }

  const rowActions: TableProps<any>['rowActions'] = [{
    label: $t({ defaultMessage: 'View' }),
    // visible: (rows) => isActionVisible(rows, { selectOne: true }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Compare' }),
    // visible: (rows) => isActionVisible(rows, { selectOne: true }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Restore' }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Download' }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }
 ]

  return <>
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableData}
        rowActions={rowActions}
        // pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </Loader>
  </>
}