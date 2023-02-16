import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import {
  AdaptivePolicy,
  getPolicyDetailsLink, getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { adpativePolicyList, assignConditions } from './__test__/fixtures'


function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<AdaptivePolicy>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          // eslint-disable-next-line max-len
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ADAPTIVE_POLICY,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}
          >{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Access Conditions' }),
      key: 'accessConditions',
      dataIndex: 'accessConditions',
      align: 'center',
      render: function () {
        return assignConditions.content.length
      }
    },
    {
      title: $t({ defaultMessage: 'Policy Set Membership' }),
      key: 'policySetCount',
      dataIndex: 'policySetCount',
      align: 'center',
      render: function () {
        return '0'
      }
    }
  ]
  return columns
}

export default function AdaptivePolicyTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const AdaptivePolicyTable = () => {

    const list = adpativePolicyList.content as AdaptivePolicy []

    const rowActions: TableProps<AdaptivePolicy>['rowActions'] = [{
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id!
          })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: ([{ name, id }], clearSelection) => {
        // showActionModal({
        //   type: 'confirm',
        //   customContent: {
        //     action: 'DELETE',
        //     entityName: $t({ defaultMessage: 'group' }),
        //     entityValue: name,
        //     confirmationText: 'Delete'
        //   },
        //   onOk: async () => {
        //     deleteGroup({ params: { policyId: id } })
        //       .unwrap()
        //       .then(() => {
        //         showToast({
        //           type: 'success',
        //           content: $t({ defaultMessage: 'Group {name} was deleted' }, { name })
        //         })
        //         clearSelection()
        //       }).catch((error) => {
        //         showToast({
        //           type: 'error',
        //           content: error.data.message
        //         })
        //       })
        //   }
        // })
      }
    }]

    return (
      // <Loader states={[
      //   tableQuery,
      //   { isLoading: false, isFetching: isDeleteMacGroupUpdating }
      // ]}>
      <Table
        columns={useColumns()}
        dataSource={list}
        // pagination={tableQuery.pagination}
        // onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
        actions={[{
          label: $t({ defaultMessage: 'Add Group' }),
          onClick: () => {
            navigate({
              ...tenantBasePath,
              pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
                type: PolicyType.ADAPTIVE_POLICY,
                oper: PolicyOperation.CREATE
              })
            })
          }
        }]}
      />
      // </Loader>
    )
  }

  return (
    <AdaptivePolicyTable />
  )
}
