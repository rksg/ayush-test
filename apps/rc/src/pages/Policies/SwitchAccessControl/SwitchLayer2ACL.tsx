
import { Col }     from 'antd'
import Row         from 'antd/lib/row'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useDeleteLayer2AclMutation, useGetLayer2AclsQuery } from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getScopeKeyByPolicy,
  MacAcl,
  macAclRulesParser,
  PolicyOperation,
  PolicyType,
  SwitchRbacUrlsInfo,
  useTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }               from '@acx-ui/types'
import { getOpsApi }                  from '@acx-ui/utils'

import * as UI from './styledComponents'
export function SwitchLayer2ACL () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/accessControl/switch')
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const settingsId = 'switch-layer2-access-control'

  const [deleteAccessControl] = useDeleteLayer2AclMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetLayer2AclsQuery,
    defaultPayload: {
      pagination: { settingsId }
    },
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
      searchable: true,
      sorter: true,
      fixed: 'left',
      width: 500,
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/${row.id}/overview`
            }, { replace: true })
          }}
        >
          {row.name}
        </Button>
    },
    {
      key: 'macAclRules',
      title: $t({ defaultMessage: 'Rules' }),
      dataIndex: 'macAclRules',
      render: (_, row) => {
        const rules = macAclRulesParser(row.macAclRules || [])

        return <Tooltip
          title={
            <UI.TooltipContainer>
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <UI.TooltipTitle>
                    {$t({ defaultMessage: 'Permit' })}
                  </UI.TooltipTitle>
                  <div>{rules.permit} {$t({ defaultMessage: 'rule(s)' })}</div>
                </Col>
              </Row>
              <UI.RowSpace />
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <UI.TooltipTitle>
                    {$t({ defaultMessage: 'Deny' })}
                  </UI.TooltipTitle>
                  <div>{rules.deny} {$t({ defaultMessage: 'rule(s)' })}</div>
                </Col>
              </Row>
            </UI.TooltipContainer>
          }
          dottedUnderline={row.macAclRules?.length ? true : false}
          placement='bottom'
        >
          {row?.macAclRules?.length ?? 0}
        </Tooltip>
      }
    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      render: (_, row) => {
        if (!row.appliedSwitchesInfo || row.appliedSwitchesInfo.length === 0) return 0

        const tooltipItems = Array.from(
          new Set(row.appliedSwitchesInfo.map(item => item.switchName))
        )

        return (
          <Tooltip
            title={tooltipItems.map((p: string) => p).join('\n')}
            dottedUnderline={tooltipItems.length > 0}
            placement='bottom'
          >
            {tooltipItems.length}
          </Tooltip>
        )
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      render: (_, row) => {
        if (!row.appliedSwitchesInfo || row.appliedSwitchesInfo.length === 0) return 0

        const uniqueVenues = Array.from(
          new Set(row.appliedSwitchesInfo.map(item => item.venueName))
        )

        return (
          <Tooltip
            title={uniqueVenues.map((p: string) => p).join('\n')}
            dottedUnderline={uniqueVenues.length > 0}
            placement='bottom'
          >
            {uniqueVenues.length}
          </Tooltip>
        )
      }
    }
  ]

  const actions = [{
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.SWITCH_ACCESS_CONTROL, PolicyOperation.CREATE),
    scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_ACCESS_CONTROL, PolicyOperation.CREATE),
    label: $t({ defaultMessage: 'Add Layer 2 Policy' }),
    onClick: () => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/layer2/add`
      }, { replace: true })
    }
  }]
  const allowedActions = filterByAccessForServicePolicyMutation(actions)

  const rowActions: TableProps<MacAcl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitchMacAcl)],
      onClick: (selectedRows, clearSelection) => {
        if (selectedRows.length === 1) {
          navigate(basePath.pathname + `/${selectedRows[0].id}/edit`, {
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
        const appliedSwitchesCount = selectedRows.reduce(
          (count, row) => count + (row.appliedSwitchesInfo?.length || 0), 0)

        if(appliedSwitchesCount > 0) {
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete MAC ACL(s)?' }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Deleting this MAC ACL(s) will cause the associated ports to lose the configuration. Are you sure you want to delete this MAC ACL(s)? ' }),
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
                )).then(clearSelection)
            }
          })
        }else{
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {macAclTitle}?' },
              { macAclTitle: selectedRows.length === 1 ?
                selectedRows[0].name : $t({ defaultMessage: 'Mac ACLs' }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Are you sure you want to delete {count, plural, one {this MAC ACL} other {these MAC ACLs}}?' }, { count: selectedRows.length }),
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
                )).then(clearSelection)
            }
          })
        }
      }
    }
  ]

  return (
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
        actions={allowedActions}
        rowActions={rowActions}
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </Loader>
  )
}