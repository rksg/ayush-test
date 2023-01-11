/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, showActionModal, showToast }    from '@acx-ui/components'
import { useDeleteConfigBackupsMutation, useDownloadConfigBackupMutation, useGetSwitchConfigBackupListQuery }                            from '@acx-ui/rc/services'
import { BACKUP_DISABLE_TOOLTIP, ConfigurationBackup, handleBlobDownloadFile, useTableQuery } from '@acx-ui/rc/utils'

import { SwitchDetailsContext } from '../..'
import { ViewConfigurationModal } from './ViewConfigurationModal'
import { useParams } from '@acx-ui/react-router-dom'
import moment from 'moment-timezone'

export function SwitchConfigBackupTable () {
  const { $t } = useIntl()
  const params = useParams()
  const [viewVisible, setViewVisible] = useState(false)
  const [viewData, setViewData] = useState(null as unknown as ConfigurationBackup)

  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const [ deleteConfigBackups ] = useDeleteConfigBackupsMutation()
  const [ downloadConfigBackup ] = useDownloadConfigBackupMutation()
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

  const showDeleteModal = async ( rows: ConfigurationBackup[], callBack?: ()=>void ) => {
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
      okText: 'Delete',
      onOk: () => {
        const idList = rows.map(item => item.id)
        deleteConfigBackups({ params, payload: idList })
        .then(callBack)
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
    onClick: (rows) => {
      downloadBackup(rows[0].id)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showDeleteModal(rows, clearSelection)
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