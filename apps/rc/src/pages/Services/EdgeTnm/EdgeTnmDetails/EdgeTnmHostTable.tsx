import { useState } from 'react'

import { Space }   from 'antd'
import { find }    from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button
} from '@acx-ui/components'
import { useDeleteEdgeTnmHostMutation, useGetEdgeTnmHostListQuery } from '@acx-ui/rc/services'
import {
  EdgeTnmHostSetting,
  getScopeKeyByService,
  ServiceType,
  ServiceOperation,
  filterByAccessForServicePolicyMutation
} from '@acx-ui/rc/utils'

import { EdgeTnmHostGraphTable } from './EdgeTnmGraphTable'
import { TnmHostModal }          from './TnmHostModal'

enum hostModalModeEnum {
  CLOSE ,
  CREATE,
  EDIT
}
export const EdgeTnmHostTable = (props: { serviceId: string | undefined }) => {
  const { $t } = useIntl()
  const { serviceId } = props

  const [hostModalMode, setHostModalMode] = useState<hostModalModeEnum>(hostModalModeEnum.CLOSE)
  const [currentHost, setCurrentHost] = useState<string | undefined>(undefined)

  const [deleteFn, { isLoading: isDeleting }] = useDeleteEdgeTnmHostMutation()
  const { data: hostList, isLoading, isFetching } = useGetEdgeTnmHostListQuery({
    params: { serviceId }
  }, { skip: !serviceId })

  const rowActions: TableProps<EdgeTnmHostSetting>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows) => {
        setCurrentHost(rows[0].hostid)
        setHostModalMode(hostModalModeEnum.EDIT)
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Host' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({
              params: { serviceId, hostId: row.hostid }
            }).unwrap()))
              .then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.DELETE)
    }
  ]

  const tableActions = [{
    label: $t({ defaultMessage: 'Add Host' }),
    scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.CREATE),
    onClick: () => {
      setHostModalMode(hostModalModeEnum.CREATE)
    }
  }]

  const handleCloseModal = () => {setHostModalMode(hostModalModeEnum.CLOSE)}

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return <Loader states={[{ isLoading, isFetching: isDeleting || isFetching }]}>
    <Space size={60} direction='vertical'>
      <Table
        rowKey='hostid'
        columns={useColumns(setCurrentHost)}
        dataSource={hostList}
        pagination={{
          defaultPageSize: 5,
          pageSize: 5
        }}
        rowActions={allowedRowActions}
        rowSelection={!!allowedRowActions.length && { type: 'checkbox' }}
        actions={filterByAccessForServicePolicyMutation(tableActions)}
      />
      <EdgeTnmHostGraphTable
        serviceId={serviceId}
        hostId={currentHost}
      />
    </Space>
    { serviceId && <TnmHostModal
      serviceId={serviceId}
      visible={hostModalMode !== hostModalModeEnum.CLOSE}
      onClose={handleCloseModal}
      editData={hostModalMode === hostModalModeEnum.EDIT
        ? find(hostList, { hostid: currentHost })
        : undefined}
    />}
  </Loader>
}

function useColumns (setCurrentHost: (id: string) => void) {
  const { $t } = useIntl()
  const columns: TableProps<EdgeTnmHostSetting>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Host Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) => {
        return <Button type='link'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentHost(row.hostid)
          }}
        >
          {row.name}
        </Button>
      }
    },
    {
      key: 'interfaces',
      title: $t({ defaultMessage: 'Interface' }),
      dataIndex: 'interfaces',
      render: (_, row) => <Space>
        {row.interfaces.map(item => `${item.ip}: ${item.port}`)}
      </Space>
    },
    {
      key: 'parentTemplates',
      title: $t({ defaultMessage: 'Templates' }),
      dataIndex: 'parentTemplates',
      render: (_, row) => <Space size={0} split={<span>,&nbsp;&nbsp;</span>}>
        {row.parentTemplates.map(item => item.name)}
      </Space>
    }
  ]

  return columns
}