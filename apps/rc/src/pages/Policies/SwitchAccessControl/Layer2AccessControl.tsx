import React from 'react'

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
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { useDeleteAccessControlMutation, useGetAccessControlsListQuery } from '@acx-ui/rc/services'
import {
  MacAcl,
  macAclRulesParser,
  SwitchRbacUrlsInfo,
  useTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }               from '@acx-ui/types'
import { getOpsApi }                  from '@acx-ui/utils'

import * as UI from './styledComponents'
export function Layer2AccessControl () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/accessControl/switch')
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const switchAccessControlPage = '/policies/accessControl/switch'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)

  const [deleteAccessControl] = useDeleteAccessControlMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetAccessControlsListQuery,
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
    </Loader>
  )
}