/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, Descriptions }    from '@acx-ui/components'
import { useGetSwitchConfigBackupListQuery }                            from '@acx-ui/rc/services'
import { BACKUP_DISABLE_TOOLTIP, ConfigurationBackup, DispatchFailedReason, useTableQuery } from '@acx-ui/rc/utils'

import * as UI         from './styledComponents'
import { SwitchDetailsContext } from '../..'
import { ViewConfigurationModal } from './ViewConfigurationModal'

export function SwitchConfigBackupTable () {
  const { $t } = useIntl()
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const [viewVisible, setViewVisible] = useState(false)
  const [viewData, setViewData] = useState(null as unknown as ConfigurationBackup)
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([] as DispatchFailedReason[])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationBackup)
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const { currentSwitchOperational } = switchDetailsContextData

  const showViewModal = (row: ConfigurationBackup[]) => {
    setViewData(row[0])
    setViewVisible(true)
  }

  const handleCancelViewModal = () => {
    setViewData(null as unknown as ConfigurationBackup)
    setViewVisible(false)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchConfigBackupListQuery,
    defaultPayload: {}
  })

  const tableData = tableQuery.data?.data ?? []

  const columns: TableProps<ConfigurationBackup>['columns'] = [{
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
    disabled: (rows) => !isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      showViewModal(rows)
    }
  }, {
    label: $t({ defaultMessage: 'Compare' }),
    disabled: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Restore' }),
    disabled: (rows) => !isActionVisible(rows, { selectOne: true }),
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Download' }),
    disabled: (rows) => !isActionVisible(rows, { selectOne: true }),
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: () => {
      // TODO:
    }
  }
 ]

 const rightActions = [{
    label: $t({ defaultMessage: 'Backup Now' }),
    disabled: !currentSwitchOperational,
    tooltip: $t(BACKUP_DISABLE_TOOLTIP),
    onClick: () => {
      // TODO:
    }
 }]

  return <>
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={tableData}
        rowActions={rowActions}
        actions={rightActions}
        pagination={false}
        onChange={tableQuery.handleTableChange}
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </Loader>
    <ViewConfigurationModal 
      data={viewData}
      visible={viewVisible}
      handleCancel={handleCancelViewModal}
    />
  </>
}