import { ReactNode, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal, showToast
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SimpleListTooltip }      from '@acx-ui/rc/components'
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
  MacRegistrationPool,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

import { returnExpirationString } from '../MacRegistrationListUtils'

export default function MacRegistrationListsTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [policySetMap, setPolicySetMap] = useState(new Map())
  const [networkVenuesMap, setNetworkVenuesMap] = useState(new Map())
  const params = useParams()

  const policyEnabled = useIsSplitOn(Features.POLICY_MANAGEMENT)

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

    getNetworkList({
      params,
      payload: {
        fields: [ 'venues', 'id' ]
      } }).then(result => {
      const networkList = new Map()
      result.data?.data.forEach(n => networkList.set(n.id, n.venues.names))
      setNetworkVenuesMap(networkList)
    })

    if(policyEnabled) {
      tableQuery.data?.data.forEach(macPools => {
        const { policySetId } = macPools
        if (policySetId) {
          getAdaptivePolicySet({ params: { policySetId } })
            .then(result => {
              // eslint-disable-next-line max-len
              setPolicySetMap(map => new Map(map.set(policySetId, result.data?.name ?? policySetId)))
            })
        }
      })
    }
  }, [tableQuery.data])

  function useColumns () {
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
        dataIndex: 'defaultAccess',
        show: policyEnabled,
        render: function (data:ReactNode, row:MacRegistrationPool) {
          return row.policySetId ? row.defaultAccess: ''
        }
      },
      {
        title: $t({ defaultMessage: 'Access Policy Set' }),
        key: 'policySet',
        dataIndex: 'policySet',
        show: policyEnabled,
        render: function (data:ReactNode, row:MacRegistrationPool) {
          return row.policySetId ? policySetMap.get(row.policySetId) : ''
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
          if(networkVenuesMap.size > 0) {
            // eslint-disable-next-line max-len
            const venueNames = row.networkIds?.map(id => networkVenuesMap.get(id)).flat().filter(item => item)
            const toolTipItems: string [] = Array.from(new Set(venueNames))
            return toolTipItems.length === 0 ? 0 :
              <SimpleListTooltip items={toolTipItems} displayText={toolTipItems.length}/>
          }
          return 0
        }
      }
    ]
    return columns
  }

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
      (selectedItem && selectedItem.associationIds && selectedItem.networkIds)
        ? selectedItem.associationIds.length > 0 || selectedItem.networkIds.length > 0: false
    ),
    onClick: ([{ name, id }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'List' }),
          entityValue: name
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
        <Table<MacRegistrationPool>
          settingsId='mac-reg-list-table'
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
