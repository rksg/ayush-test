import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { useGetSwitchMacAclsQuery, useDeleteSwitchMacAclMutation } from '@acx-ui/rc/services'
import {
  MacAcl,
  SwitchRbacUrlsInfo,
  SwitchViewModel,
  useTableQuery
} from '@acx-ui/rc/utils'
import { SwitchScopes }   from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'
import { getOpsApi }      from '@acx-ui/utils'

import { MacACLDetail } from './MacACLDetail'
import { MacACLDrawer } from './MacACLDrawer'

export function MacACLs (props: {
  switchDetail?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const { switchDetail } = props
  const [currentRow, setCurrentRow] = useState({} as MacAcl)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [macACLData, setMacACLData] = useState({} as unknown as MacAcl)
  const [editMode, setEditMode] = useState(false)
  const [macAClsDrawerVisible, setMacAClsDrawerVisible] = useState(false)
  const [macAClsDetailVisible, setMacAClsDetailVisible] = useState(false)

  const [deleteSwitchMacAcl] = useDeleteSwitchMacAclMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchMacAclsQuery,
    defaultPayload: {},
    enableRbac: isSwitchRbacEnabled,
    apiParams: { venueId: (switchDetail?.venueId || '') as string },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<MacAcl>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ACL Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      width: 500,
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            setCurrentRow(row)
            setMacAClsDetailVisible(true)
          }}
        >
          {row.name}
        </Button>
    },
    {
      key: 'sharedWithPolicyAndProfile',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'sharedWithPolicyAndProfile',
      render: (_, row) => row.customized ?
        $t({ defaultMessage: 'Customized' }) : $t({ defaultMessage: 'Shared' })
    }
  ]

  const tableActions = [{
    label: $t({ defaultMessage: 'Add MAC ACL' }),
    scopeKey: [SwitchScopes.CREATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitchVlans)],
    onClick: () => {
      setEditMode(false)
      setMacACLData({} as MacAcl)
      setMacAClsDrawerVisible(true)
    }
  }]

  const rowActions: TableProps<MacAcl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitchMacAcl)],
      onClick: (selectedRows, clearSelection) => {
        if (selectedRows.length === 1) {
          setEditMode(true)
          setMacACLData(selectedRows[0])
          setMacAClsDrawerVisible(true)
        }
        clearSelection()
      },
      disabled: (selectedRows) => selectedRows.length > 1
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteSwitchMacAcl)],
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Delete MAC ACL(s)?' }),
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'Deleting this MAC ACL(s) will cause the associated ports to lose the configuration. Are you sure you want to delete this MAC ACL(s)? ' }),
          okText: $t({ defaultMessage: 'Delete' }),
          cancelText: $t({ defaultMessage: 'Cancel' }),
          onOk: () => {
            deleteSwitchMacAcl({
              params: { venueId: switchDetail?.venueId, switchId: switchDetail?.id },
              payload: selectedRows.map(selectedRows => { return selectedRows.id }) })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <Loader
      states={[tableQuery]}
    >
      <Table
        rowKey='id'
        columns={columns}
        type={'tall'}
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={tableQuery.data?.data}
        actions={filterByAccess(tableActions)}
        rowActions={rowActions}
        rowSelection={{
          type: 'checkbox'
        }}
      />

      {macAClsDetailVisible && <MacACLDetail
        visible={macAClsDetailVisible}
        setVisible={setMacAClsDetailVisible}
        macACLData={currentRow}
      />
      }

      {macAClsDrawerVisible && <MacACLDrawer
        visible={macAClsDrawerVisible}
        setVisible={setMacAClsDrawerVisible}
        editMode={editMode}
        macACLData={macACLData}
        venueId={switchDetail?.venueId || ''}
      />}

    </Loader>
  )
}
