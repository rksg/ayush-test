import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useDelVLANPoolPolicyMutation,
  useDelRoguePolicyMutation,
  usePolicyListQuery,
  useDeleteAccessControlProfileMutation,
  useDelL2AclPolicyMutation,
  useDelL3AclPolicyMutation,
  useDelAppPolicyMutation,
  useDelDevicePolicyMutation,
  useDeleteApSnmpPolicyMutation
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getSelectPolicyRoutePath,
  Policy,
  PolicyOperation,
  PolicyTechnology,
  PolicyType,
  RogueApConstant,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                    from '@acx-ui/user'

import { policyTechnologyLabelMapping, policyTypeLabelMapping } from '../contentsMap'


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

  const [ delVLANPoolPolicy ] = useDelVLANPoolPolicyMutation()
  // const [ delRoguePolicy ] = useDelRoguePolicyMutation()

  const deletePolicyFnMapping = {
    [PolicyType.ROGUE_AP_DETECTION]: useDelRoguePolicyMutation(),
    [PolicyType.CLIENT_ISOLATION]: [],
    [PolicyType.AAA]: [],
    [PolicyType.ACCESS_CONTROL]: useDeleteAccessControlProfileMutation(),
    [PolicyType.MAC_REGISTRATION_LIST]: [],
    [PolicyType.SYSLOG]: [],
    [PolicyType.VLAN_POOL]: [],
    [PolicyType.LAYER_2_POLICY]: useDelL2AclPolicyMutation(),
    [PolicyType.LAYER_3_POLICY]: useDelL3AclPolicyMutation(),
    [PolicyType.APPLICATION_POLICY]: useDelAppPolicyMutation(),
    [PolicyType.DEVICE_POLICY]: useDelDevicePolicyMutation(),
    [PolicyType.SNMP_AGENT]: useDeleteApSnmpPolicyMutation(),
    [PolicyType.ADAPTIVE_POLICY]: [],
    [PolicyType.ADAPTIVE_POLICY_SET]: [],
    [PolicyType.RADIUS_ATTRIBUTE_GROUP]: [],
    [PolicyType.TUNNEL_PROFILE]: [],
    [PolicyType.CONNECTION_METERING]: []
  }

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<Policy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: ([row]) => row && row.name !== RogueApConstant.DefaultProfile,
      onClick: ([{ id, name, type }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: async () => {
            const [ deleteFn ] = deletePolicyFnMapping[type]
            if (deleteFn) {
              deleteFn({ params: { ...params, policyId: id } }).then(clearSelection)
            }

            if (type === PolicyType.VLAN_POOL) {
              await delVLANPoolPolicy({
                params: {
                  ...params, policyId: id
                }
              }).unwrap()
            }

            clearSelection()
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: ([row]) => row && row.name !== RogueApConstant.DefaultProfile,
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
        extra={filterByAccess([
          <TenantLink to={getSelectPolicyRoutePath(true)}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Policy or Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
        />
      </Loader>
    </>
  )
}
