/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, showActionModal, showToast }    from '@acx-ui/components'
import { useDeleteConfigBackupsMutation, useDownloadConfigBackupMutation, useGetSwitchConfigBackupListQuery, useRestoreConfigBackupMutation }                            from '@acx-ui/rc/services'
import { BACKUP_DISABLE_TOOLTIP, BACKUP_IN_PROGRESS_TOOLTIP, ConfigurationBackup, handleBlobDownloadFile, RESTORE_IN_PROGRESS_TOOLTIP, useTableQuery } from '@acx-ui/rc/utils'

import { SwitchDetailsContext } from '../..'
import { ViewConfigurationModal } from './ViewConfigurationModal'
import { useParams } from '@acx-ui/react-router-dom'
import moment from 'moment-timezone'

export function SwitchConfigBackupTable () {
  const { $t } = useIntl()
  const params = useParams()
  const [viewVisible, setViewVisible] = useState(false)
  const [backupButtonnStatus, setBackupButtonnStatus] = useState({ disabled: false, tooltip: ''})
  const [enabledRowButton, setEnabledRowButton] = useState([] as string[])
  const [viewData, setViewData] = useState(null as unknown as ConfigurationBackup)

  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const [ restoreConfigBackup ] = useRestoreConfigBackupMutation()
  const [ downloadConfigBackup ] = useDownloadConfigBackupMutation()
  const [ deleteConfigBackups ] = useDeleteConfigBackupsMutation()
  const { currentSwitchOperational, switchName } = switchDetailsContextData

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

  const setBackupButton = () => {
    const listInRestoreProgress = tableData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING');
    const listInBackupProgress = tableData.find(item => item.status === 'STARTED' || item.status === 'PENDING');
    const disableBackup = !currentSwitchOperational || listInBackupProgress || listInRestoreProgress;
    let tooltip = '';
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
    if(tableData) {
      setBackupButton()
    }
  }, [tableData])


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

  const showDeleteModal = async ( rows: ConfigurationBackup[], clearSelection: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: rows.length === 1 
        ? $t({ defaultMessage: 'configuration backup' }) 
        : $t({ defaultMessage: 'configuration backups' }),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length,
      },
      okText: $t({ defaultMessage: 'Delete' }),
      onOk: () => {
        const idList = rows.map(item => item.id)
        deleteConfigBackups({ params, payload: idList })
        .then(clearSelection)
      }
    })
  }

  const showRestoreModal = async ( rows: ConfigurationBackup[], clearSelection: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Restore configuration from backup?' }),
      content: $t({ 
        defaultMessage: 'Restoring this file is going to replace the existing configuration on the switch with selected backup.' +
        'This operation will trigger the switch/stack reload and traffic may be affected. Are you sure you want to proceed?' 
      }),
      okText: $t({ defaultMessage: 'Restore' }),
      onOk: () => {
        restoreConfigBackup({ params:{ ...params, configId: rows[0].id} })
        .then(() => {
          showToast({
            type: 'success',
            content: $t({ defaultMessage: 'Backup {name} was restored' }, { name: rows[0].name })
          })
          clearSelection()
        })
      }
    })
  }

  const downloadBackup = (id: string) => {
    downloadConfigBackup({
      params: {
        ...params,
        configId: id
      }})
    .unwrap().then((res)=>{
      const downloadFileName = 'switch_configuration_' + switchName + '_' + moment().format('YYYYMMDDHHmmss') + '.txt'
      const blob = new Blob([res.response], { type: 'text/plain;charset=utf-8' });
      handleBlobDownloadFile(blob, downloadFileName);
    })
  }

  const rowActions: TableProps<any>['rowActions'] = [{
    label: $t({ defaultMessage: 'View' }),
    // disabled: () => !enabledRowButton.find(item => item === 'View'),
    disabled: true,
    onClick: (rows) => {
      showViewModal(rows)
    }
  }, {
    label: $t({ defaultMessage: 'Compare' }),
    // disabled: () => !enabledRowButton.find(item => item === 'Compare'),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Restore' }),
    disabled: () => !enabledRowButton.find(item => item === 'Restore'),
    onClick: (rows, clearSelection) => {
      showRestoreModal(rows, clearSelection)
    }
  }, {
    label: $t({ defaultMessage: 'Download' }),
    disabled: () => !enabledRowButton.find(item => item === 'Download'),
    onClick: (rows) => {
      downloadBackup(rows[0].id)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: () => !enabledRowButton.find(item => item === 'Delete'),
    onClick: (rows, clearSelection) => {
      showDeleteModal(rows, clearSelection)
    }
  }
 ]

 const rightActions = [{
    label: $t({ defaultMessage: 'Backup Now' }),
    disabled: backupButtonnStatus.disabled,
    tooltip: backupButtonnStatus.tooltip,
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
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedData) => {
            const selectedRows = selectedRowKeys.length
            const hasFailed = selectedData.find(item => item.status === 'FAILED');
            const inBackupProgress = selectedData.find(item => item.status === 'STARTED' || item.status === 'PENDING');
            const inRestoreProgress = selectedData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING');
            const listInRestoreProgress = tableData.find(item => item.restoreStatus === 'STARTED' || item.restoreStatus === 'PENDING');
            const listInBackupProgress = tableData.find(item => item.status === 'STARTED' || item.status === 'PENDING');
            let enabledButton:string[] = []
            if (selectedRows === 0 || hasFailed || inBackupProgress) {
              enabledButton = []
            } else if (selectedRows === 1) {
              if (inRestoreProgress) {
                enabledButton = ['View', 'Download'];
              } else {
                enabledButton = (listInRestoreProgress || listInBackupProgress) ? ['View', 'Download', 'Delete']
                  : ['View', 'Restore', 'Download', 'Delete']
              }
            } else if (selectedRows == 2) {
              if (inRestoreProgress) {
                enabledButton = ['Compare'];
              } else {
                enabledButton = ['Compare', 'Delete'];
              }
            } else if (selectedRows > 2) {
              if (inRestoreProgress) {
                enabledButton = [];
              } else {
                enabledButton = ['Delete']
              }
            }
            if (!currentSwitchOperational && enabledButton.length > 0) {
              enabledButton = enabledButton.filter(item => item !== 'Restore' && item !== 'Delete');
            }
            setEnabledRowButton(enabledButton)
          }
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