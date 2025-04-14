import React from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                            from '@acx-ui/feature-toggle'
import { useDeleteSwitchAccessControlSetMutation, useGetLayer2AclsQuery, useGetSwitchAccessControlSetQuery } from '@acx-ui/rc/services'
import {
  SwitchAccessControl,
  SwitchUrlsInfo,
  useTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }               from '@acx-ui/types'
import { getOpsApi }                  from '@acx-ui/utils'

import { SwitchLayer2ACLDetail } from './SwitchLayer2/SwitchLayer2ACLDetail'

const payload ={
  fields: [
    'id',
    'name'
  ],
  page: 1,
  pageSize: 10000,
  defaultPageSize: 10000,
  total: 0,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function SwitchAccessControlSet () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/accessControl/switch')
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const settingsId = 'switch-access-control-set'

  const [deleteAccessControl] = useDeleteSwitchAccessControlSetMutation()
  const [aclName, setAclName] = React.useState('')
  const [accessControlId, setAccessControlId] = React.useState('')
  const [layer2ACLDetailVisible, setLayer2ACLDetailVisible] = React.useState(false)


  const { data: layer2ProfileList } = useGetLayer2AclsQuery({ payload })

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchAccessControlSetQuery,
    defaultPayload: {
      fields: [
        'id',
        'policyName'
      ],
      pagination: { settingsId }
    },
    enableRbac: isSwitchRbacEnabled,
    sorter: {
      sortField: 'policyName',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<SwitchAccessControl>['columns'] = [
    {
      key: 'accessControlPolicyName',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'accessControlPolicyName',
      defaultSortOrder: 'ascend',
      searchable: true,
      width: 500,
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/${row.id}/overview`
            }, { replace: false })
          }}
        >
          {row.accessControlPolicyName}
        </Button>
    },
    {
      key: 'layer2AclPolicyName',
      title: $t({ defaultMessage: 'Layer 2' }),
      dataIndex: 'layer2AclPolicyName',
      render: (_, row) => {
        return <Button
          type='link'
          size='small'
          onClick={() => {
            if(row?.layer2AclPolicyName){
              setAccessControlId(layer2ProfileList?.data?.find(
                (acl) => acl.name === row.layer2AclPolicyName)?.id ?? '')
              setAclName(row.layer2AclPolicyName)
              setLayer2ACLDetailVisible(true)
            }
          }}>
          {row.layer2AclPolicyName}
        </Button>
      }
    }
  ]

  const rowActions: TableProps<SwitchAccessControl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.updateSwitchAccessControlSet)],
      onClick: (selectedRows, clearSelection) => {
        if (selectedRows.length === 1) {
          navigate(basePath.pathname + `/${selectedRows[0].id}/edit`, {
            replace: false
          })
        }
        clearSelection()
      },
      disabled: (selectedRows) => selectedRows.length > 1
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.deleteSwitchAccessControlSet)],
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Delete {macAclTitle}?' },
            { macAclTitle: selectedRows.length === 1 ?
              selectedRows[0].accessControlPolicyName :
              $t({ defaultMessage: '{totalCount} Mac ACLs' },
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
                    accessControlId: row.id
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
    <>
      <Loader
        states={[tableQuery]}
      >
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          type={'tall'}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          pagination={tableQuery.pagination}
          dataSource={tableQuery.data?.data}
          rowActions={rowActions}
          rowSelection={{
            type: 'checkbox'
          }}
          stickyHeaders={false}
        />
      </Loader>
      {layer2ACLDetailVisible && <SwitchLayer2ACLDetail
        visible={layer2ACLDetailVisible}
        setVisible={setLayer2ACLDetailVisible}
        aclName={aclName}
        accessControlId={accessControlId}
      />}
    </>
  )
}