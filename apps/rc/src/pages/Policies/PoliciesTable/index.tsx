import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDelRoguePolicyMutation, usePolicyListQuery }                  from '@acx-ui/rc/services'
import {
  useTableQuery,
  Policy,
  PolicyType,
  PolicyTechnology,
  getPolicyDetailsLink,
  getSelectPolicyRoutePath,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { policyTypeLabelMapping, policyTechnologyLabelMapping } from '../contentsMap'


function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Policy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: row.type as PolicyType,
              oper: PolicyOperation.DETAIL,
              policyId: row.id
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true,
      render: function (data) {
        return $t(policyTypeLabelMapping[data as PolicyType])
      }
    },
    {
      key: 'technology',
      title: $t({ defaultMessage: 'Technology' }),
      dataIndex: 'technology',
      sorter: true,
      render: function (data) {
        return $t(policyTechnologyLabelMapping[data as PolicyTechnology])
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true
    }
  ]

  return columns
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'id',
    'name',
    'type',
    'technology',
    'scope',
    'cog',
    'health',
    'tags'
  ]
}

export default function PoliciesTable () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const DEFAULT_PROFILE = 'Default profile'

  const [ delRoguePolicy ] = useDelRoguePolicyMutation()

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<Policy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: ([row]) => row && row.name !== DEFAULT_PROFILE,
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: async () => {
            await delRoguePolicy({
              params: {
                ...params, policyId: id
              }
            }).unwrap()
            clearSelection()
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: ([row]) => row && row.name !== DEFAULT_PROFILE,
      onClick: ([{ type, id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: type as PolicyType,
            oper: PolicyOperation.EDIT,
            policyId: id
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'Policies & Profiles ({policyCount})'
          }, {
            policyCount: tableQuery.data?.totalCount
          })
        }
        extra={[
          <TenantLink to={getSelectPolicyRoutePath(true)} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Policy or Profile' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[tableQuery]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
