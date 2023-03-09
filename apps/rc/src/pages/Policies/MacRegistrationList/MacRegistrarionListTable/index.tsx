import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal, showToast
} from '@acx-ui/components'
import {
  useDeleteMacRegListMutation,
  useLazyGetAdaptivePolicySetQuery,
  useLazyNetworkListQuery,
  useMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  MacRegistrationDetailsTabKey,
  MacRegistrationPool, Network,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'

import { returnExpirationString } from '../MacRegistrationListUtils'


function useColumns (policySets: Map<string, string>, venueCountMap: Map<string, string>) {
  const { $t } = useIntl()
  const columns: TableProps<MacRegistrationPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row, _, highlightFn) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.MAC_REGISTRATION_LIST,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!,
              activeTab: MacRegistrationDetailsTabKey.OVERVIEW
            })}
          >{highlightFn(data as string)}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'List Expiration' }),
      key: 'listExpiration',
      dataIndex: 'listExpiration',
      render: function (data, row) {
        return returnExpirationString(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Default Access' }),
      key: 'defaultAccess',
      dataIndex: 'defaultAccess'
    },
    {
      title: $t({ defaultMessage: 'Access Policy Set' }),
      key: 'policySet',
      dataIndex: 'policySet',
      render: function (data, row) {
        return row.policySetId ? policySets.get(row.policySetId) : ''
      }
    },
    {
      title: $t({ defaultMessage: 'MAC Addresses' }),
      key: 'registrationCount',
      dataIndex: 'registrationCount',
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.MAC_REGISTRATION_LIST,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!,
              activeTab: MacRegistrationDetailsTabKey.MAC_REGISTRATIONS
            })}
          >{row.registrationCount ?? 0}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      key: 'venueCount',
      dataIndex: 'venueCount',
      align: 'center',
      render: function (data, row) {
        return venueCountMap.get(row.id!) ?? 0
      }
    }
  ]
  return columns
}

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [policySetMap, setPolicySetMap] = useState(new Map())
  const [venueCountMap, setVenueCountMap] = useState(new Map())
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useMacRegListsQuery,
    defaultPayload: {}
  })

  const [
    deleteMacRegList,
    { isLoading: isDeleteMacRegListUpdating }
  ] = useDeleteMacRegListMutation()

  const [getAdaptivePolicySet] = useLazyGetAdaptivePolicySetQuery()
  const [getNetworkList] = useLazyNetworkListQuery()

  useEffect(() => {
    if (tableQuery.isLoading)
      return

    const policySets = new Map()
    const venueCountMap = new Map()

    tableQuery.data?.data.forEach(macPools => {
      const { id, policySetId, networkIds } = macPools
      if (policySetId) {
        getAdaptivePolicySet({ params: { policyId: policySetId } })
          .then(result => {
            if (result.data) {
              policySets.set(policySetId, result.data.name)
            }
          })
      }

      if(networkIds && networkIds.length > 0) {
        getNetworkList({
          params,
          payload: {
            fields: [ 'venues', 'id' ],
            filters: { id: networkIds && networkIds?.length > 0 ? networkIds : [''] }
          } }).then(result => {
          if (result.data?.data) {
            // eslint-disable-next-line max-len
            const count = result.data.data.reduce((accumulator: number, currentValue:Network) => accumulator + currentValue.venues.count, 0)
            venueCountMap.set(id, count)
          }
        })
      }
    })
    setPolicySetMap(policySets)
    setVenueCountMap(venueCountMap)
  }, [tableQuery.data])

  const rowActions: TableProps<MacRegistrationPool>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.MAC_REGISTRATION_LIST,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!
        })
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: (([selectedItem]) =>
      (selectedItem && selectedItem.associationIds)
        ? selectedItem.associationIds.length > 0 : false
    ),
    onClick: ([{ name, id }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'List' }),
          entityValue: name,
          confirmationText: 'Delete'
        },
        onOk: () => {
          deleteMacRegList({ params: { policyId: id } })
            .unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'List {name} was deleted' }, { name })
              })
              clearSelection()
            }).catch((error) => {
              console.log(error) // eslint-disable-line no-console
            })
        }
      })
    }
  }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteMacRegListUpdating }
      ]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={$t({ defaultMessage: 'MAC Registration Lists' })}
        extra={filterByAccess([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          >
            <Button type='primary'>{ $t({ defaultMessage: 'Add MAC Registration List' }) }</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteMacRegListUpdating }
      ]}>
        <Table
          columns={useColumns(policySetMap, venueCountMap)}
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
