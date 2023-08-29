/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, showActionModal, showToast }                                                                              from '@acx-ui/components'
import { useDeleteConfigBackupsMutation, useDownloadConfigBackupMutation, useGetSwitchConfigBackupListQuery, useRestoreConfigBackupMutation } from '@acx-ui/rc/services'
import { BACKUP_DISABLE_TOOLTIP, BACKUP_IN_PROGRESS_TOOLTIP, ConfigurationBackup, RESTORE_IN_PROGRESS_TOOLTIP, usePollingTableQuery }         from '@acx-ui/rc/utils'
import { useParams }                                                                                                                          from '@acx-ui/react-router-dom'
import { filterByAccess, getShowWithoutRbacCheckKey, hasAccess }                                                                              from '@acx-ui/user'
import { handleBlobDownloadFile }                                                                                                             from '@acx-ui/utils'

import { SwitchDetailsContext } from '../..'

import { BackupModal }               from './BackupModal'
import { CompareConfigurationModal } from './CompareConfigurationModal'
import { ViewConfigurationModal }    from './ViewConfigurationModal'

interface clearTableSelection {
  clearSelection: () => void
}

export function SwitchConfigBackupTable () {
  const { $t } = useIntl()
  const params = useParams()
  const [viewVisible, setViewVisible] = useState(false)
  const [compareVisible, setCompareVisible] = useState(false)
  const [viewData, setViewData] = useState(null as unknown as ConfigurationBackup)
  const [compareData, setCompareData] = useState({
    left: null as unknown as ConfigurationBackup,
    right: null as unknown as ConfigurationBackup
  })
  const [backupModalVisible, setBackupModalVisible] = useState(false)
  const [backupButtonnStatus, setBackupButtonnStatus] = useState({ disabled: false, tooltip: '' })
  const [enabledRowButton, setEnabledRowButton] = useState([] as string[])
  const [tableClearSelection, setTableClearSelection] = useState(null as unknown as clearTableSelection)

  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const [ restoreConfigBackup ] = useRestoreConfigBackupMutation()
  const [ downloadConfigBackup ] = useDownloadConfigBackupMutation()
  const [ deleteConfigBackups ] = useDeleteConfigBackupsMutation()
  const { currentSwitchOperational } = switchDetailsContextData

  const showViewModal = (rows: ConfigurationBackup[], clearSelection: ()=>void) => {
    setViewData(rows[0])
    setViewVisible(true)
    setTableClearSelection({
      clearSelection
    })
  }

  const handleCancelViewModal = () => {
    setViewData(null as unknown as ConfigurationBackup)
    setViewVisible(false)
  }

  const showCompareModal = (rows: ConfigurationBackup[]) => {
    setCompareData({
      left: rows[0],
      right: rows[1] || rows[0]
    })
    setCompareVisible(true)
  }

  const handleCancelCompareModal = () => {
    setCompareVisible(false)
  }

  const tableQuery = usePollingTableQuery({
    useQuery: useGetSwitchConfigBackupListQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'createdDate',
      sortOrder: 'DESC'
    },
    option: { pollingInterval: 60_000 }
  })

  const tableData = tableQuery.data?.data ?? []

  const setBackupButton = () => {
    const listInRestoreProgress = tableData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING')
    const listInBackupProgress = tableData.find(item => item.status === 'STARTED' || item.status === 'PENDING')
    const disableBackup = !currentSwitchOperational || listInBackupProgress || listInRestoreProgress
    let tooltip = ''
    if (!currentSwitchOperational) {
      tooltip = $t(BACKUP_DISABLE_TOOLTIP)
    } else if (listInBackupProgress) {
      tooltip = $t(BACKUP_IN_PROGRESS_TOOLTIP)
    } else if (listInRestoreProgress) {
      tooltip = $t(RESTORE_IN_PROGRESS_TOOLTIP)
    }
    setBackupButtonnStatus({
      disabled: !!disableBackup,
      tooltip
    })
  }

  useEffect(() => {
    if(tableQuery.data) {
      setBackupButton()
    }
  }, [tableQuery.data])


  const columns: TableProps<ConfigurationBackup>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    disable: true,
    sorter: true
  }, {
    key: 'createdDate',
    title: $t({ defaultMessage: 'Date' }),
    dataIndex: 'createdDate',
    defaultSortOrder: 'descend',
    sorter: true
  }, {
    key: 'backupType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'backupType',
    sorter: true
  }, {
    key: 'backupStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'status',
    sorter: true,
    render: (_, row) => row.backupStatus
  }
  ]

  const showDeleteModal = async ( rows: ConfigurationBackup[], clearSelection: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t(
          { defaultMessage: '{count, plural, one {configuration backup} other {configuration backups}}' },
          { count: rows.length }
        ),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length
      },
      okText: $t({ defaultMessage: 'Delete' }),
      onOk: () => {
        const idList = rows.map(item => item.id)
        deleteConfigBackups({ params, payload: idList })
          .then(clearSelection)
      }
    })
  }

  const showRestoreModal = async ( row: ConfigurationBackup, clearSelection: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Restore configuration from backup?' }),
      content: $t({
        defaultMessage: 'Restoring this file is going to replace the existing configuration on the switch with selected backup.' +
        'This operation will trigger the switch/stack reload and traffic may be affected. Are you sure you want to proceed?'
      }),
      okText: $t({ defaultMessage: 'Restore' }),
      onOk: () => {
        restoreConfigBackup({ params: { ...params, configId: row.id } })
          .then(() => {
            showToast({
              type: 'success',
              content: $t({ defaultMessage: 'Backup {name} was restored' }, { name: row.name })
            })
            clearSelection()
          })
      }
    })
  }

  const downloadBackup = (row: ConfigurationBackup) => {
    downloadConfigBackup({
      params: {
        ...params,
        configId: row.id
      } })
      .unwrap().then((res)=>{
        const downloadFileName = row.name + '.txt'
        const blob = new Blob([res.response], { type: 'text/plain;charset=utf-8' })
        handleBlobDownloadFile(blob, downloadFileName)
      })
  }

  const rowActions: TableProps<ConfigurationBackup>['rowActions'] = [{
    key: getShowWithoutRbacCheckKey('ViewConfig'),
    label: $t({ defaultMessage: 'View' }),
    disabled: () => !enabledRowButton.find(item => item === 'View'),
    onClick: (rows, clearSelection) => {
      showViewModal(rows, clearSelection)
    }
  }, {
    key: getShowWithoutRbacCheckKey('CompareConfig'),
    label: $t({ defaultMessage: 'Compare' }),
    disabled: () => !enabledRowButton.find(item => item === 'Compare'),
    onClick: (rows) => {
      showCompareModal(rows)
    }
  }, {
    label: $t({ defaultMessage: 'Restore' }),
    disabled: () => !enabledRowButton.find(item => item === 'Restore'),
    onClick: (rows, clearSelection) => {
      showRestoreModal(rows[0], clearSelection)
    }
  }, {
    key: getShowWithoutRbacCheckKey('DownloadConfig'),
    label: $t({ defaultMessage: 'Download' }),
    disabled: () => !enabledRowButton.find(item => item === 'Download'),
    onClick: (rows) => {
      downloadBackup(rows[0])
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: () => !enabledRowButton.find(item => item === 'Delete'),
    onClick: (rows, clearSelection) => {
      showDeleteModal(rows, clearSelection)
    }
  }
  ]

  const viewModalActions = {
    compare: showCompareModal,
    restore: showRestoreModal,
    download: downloadBackup,
    delete: showDeleteModal
  }

  const rightActions = [{
    label: $t({ defaultMessage: 'Backup Now' }),
    disabled: backupButtonnStatus.disabled,
    tooltip: backupButtonnStatus.tooltip,
    onClick: () => {
      setBackupModalVisible(true)
    }
  }]

  return <>
    <Loader states={[tableQuery]}>
      <Table
        settingsId='switch-config-backup-table'
        rowKey='id'
        columns={columns}
        dataSource={tableData}
        rowActions={filterByAccess(rowActions)}
        actions={filterByAccess(rightActions)}
        onChange={tableQuery.handleTableChange}
        rowSelection={hasAccess() ? {
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedData) => {
            const selectedRows = selectedRowKeys.length
            const hasFailed = selectedData.find(item => item.status === 'FAILED')
            const inBackupProgress = selectedData.find(item => item.status === 'STARTED' || item.status === 'PENDING')
            const inRestoreProgress = selectedData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING')
            const listInRestoreProgress = tableData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING')
            const listInBackupProgress = tableData.find(item => item.status === 'STARTED' || item.status === 'PENDING')
            let enabledButton:string[] = []
            if (selectedRows === 0 || hasFailed || inBackupProgress) {
              enabledButton = []
            } else if (selectedRows === 1) {
              if (inRestoreProgress) {
                enabledButton = ['View', 'Download']
              } else {
                enabledButton = (listInRestoreProgress || listInBackupProgress) ? ['View', 'Download', 'Delete']
                  : ['View', 'Restore', 'Download', 'Delete']
              }
            } else if (selectedRows === 2) {
              if (inRestoreProgress) {
                enabledButton = ['Compare']
              } else {
                enabledButton = ['Compare', 'Delete']
              }
            } else if (selectedRows > 2) {
              if (inRestoreProgress) {
                enabledButton = []
              } else {
                enabledButton = ['Delete']
              }
            }
            if (!currentSwitchOperational && enabledButton.length > 0) {
              enabledButton = enabledButton.filter(item => item !== 'Restore' && item !== 'Delete')
            }
            setEnabledRowButton(enabledButton)
          }
        } : undefined}
      />
    </Loader>
    <BackupModal
      visible={backupModalVisible}
      handleCancel={() => setBackupModalVisible(false)}
    />
    {
      viewVisible &&
      <ViewConfigurationModal
        data={viewData}
        visible={viewVisible}
        handleCancel={handleCancelViewModal}
        actions={viewModalActions}
        enabledButton={enabledRowButton}
        tableClearSelection={tableClearSelection.clearSelection}
      />
    }
    {
      compareVisible &&
      <CompareConfigurationModal
        visible={compareVisible}
        configList={tableData}
        compareData={compareData}
        handleCancel={handleCancelCompareModal}
      />
    }
  </>
}
