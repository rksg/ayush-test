import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { useDeleteAccessControlMutation, useGetAccessControlsQuery } from '@acx-ui/rc/services'
import {
  MacAcl,
  SwitchRbacUrlsInfo,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }               from '@acx-ui/types'
import { getOpsApi }                  from '@acx-ui/utils'

import { MacACLDetail } from './macACLDetail'

export function SwitchAccessControl () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentRow, setCurrentRow] = useState({} as MacAcl)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [macAClsDetailVisible, setMacAClsDetailVisible] = useState(false)

  const switchAccessControlPage = '/policies/accessControl/switch'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)

  const [deleteAccessControl] = useDeleteAccessControlMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetAccessControlsQuery,
    defaultPayload: {},
    enableRbac: isSwitchRbacEnabled,
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
      render: (_, row) => row.name
      // <Button
      //   type='link'
      //   size='small'
      //   onClick={(e: React.MouseEvent) => {
      //     e.stopPropagation()
      //     setCurrentRow(row)
      //     setMacAClsDetailVisible(true)
      //   }}
      // >
      //   {row.name}
      // </Button>
    }
  ]

  const rowActions: TableProps<MacAcl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitchMacAcl)],
      onClick: (selectedRows, clearSelection) => {
        if (selectedRows.length === 1) {
          navigate(switchAccessControlLink.pathname + `/${selectedRows[0].id}/edit`, {
            replace: true
          })
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
          title: $t({ defaultMessage: 'Delete {macAclTitle}?' },
            { macAclTitle: selectedRows.length === 1 ?
              selectedRows[0].name : $t({ defaultMessage: '{totalCount} Mac ACLs' },
                { totalCount: selectedRows.length }) }),
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'Are you sure you want to delete {count, plural, one {} other {these}}?' }, { count: selectedRows.length }),
          okText: $t({ defaultMessage: 'Delete' }),
          cancelText: $t({ defaultMessage: 'Cancel' }),
          onOk: () => {
            Promise.all(
              selectedRows.map(row =>
                deleteAccessControl({
                  params: {
                    l2AclId: row.id
                  }
                })
              )
            ).then(clearSelection)
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

    </Loader>
  )
}