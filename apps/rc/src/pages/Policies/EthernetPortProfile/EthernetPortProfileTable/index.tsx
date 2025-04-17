/* eslint-disable max-len */

import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                   from '@acx-ui/rc/components'
import {
  useDeleteEthernetPortProfileMutation,
  useGetAAAPolicyViewModelListQuery,
  useGetEthernetPortProfileViewDataListQuery,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  AAAViewModalType,
  EthernetPortProfileViewData,
  filterByAccessForServicePolicyMutation,
  getEthernetPortAuthTypeString,
  getEthernetPortTypeString,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  transformDisplayOnOff,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

interface EthernetPortProfileTableProps {
  setTableTotalCount?: (totalCount: number) => void;
}

const EthernetPortProfileTable = (props: EthernetPortProfileTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { setTableTotalCount } = props
  const defaultEthernetPortProfileTablePayload = {}
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const tableQuery = useTableQuery({
    useQuery: useGetEthernetPortProfileViewDataListQuery,
    defaultPayload: defaultEthernetPortProfileTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'venue']
    }
  })

  const { radiusNameMap = [] } = useGetAAAPolicyViewModelListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    },
    enableRbac: enableServicePolicyRbac
  }, {
    selectFromResult: ({ data }: { data?: { data: AAAViewModalType[] } }) => ({
      radiusNameMap: data?.data?.map(radius => ({ key: radius.id!, value: radius.name }))
    })
  })

  const { venueNameMap =[] } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data?.map(venue => ({ key: venue.id, value: venue.name }))
    })
  })

  const [deleteEthernetPortProfile] = useDeleteEthernetPortProfileMutation()

  useEffect(() => {
    if(tableQuery.data?.totalCount && setTableTotalCount){
      setTableTotalCount(tableQuery.data?.totalCount)
    }
  }, [tableQuery.data?.totalCount])

  const columns: TableProps<EthernetPortProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        if(row.isDefault){
          return row.name
        }

        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.ETHERNET_PORT_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.id
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true,
      render: (_, { type }) => {
        return getEthernetPortTypeString(type)
      }
    },
    {
      title: $t({ defaultMessage: 'VLAN Untag' }),
      key: 'untagId',
      dataIndex: 'untagId',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'VLAN Members' }),
      key: 'vlanMembers',
      dataIndex: 'vlanMembers',
      sorter: true
    },
    {
      title: $t({ defaultMessage: '802.1X' }),
      key: 'authType',
      dataIndex: 'authType',
      sorter: true,
      render: (_, { authType }) => {
        const authTypeString = getEthernetPortAuthTypeString(authType)
        const onOff = transformDisplayOnOff(!!authTypeString)
        return `${onOff}${authTypeString && ` (${authTypeString})`}`
      }
    },
    {
      title: $t({ defaultMessage: 'Auth Service' }),
      key: 'authRadiusId',
      dataIndex: 'authRadiusId',
      sorter: false,
      render: (_, { authRadiusId }) => {
        return (!authRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: authRadiusId })}>
              {radiusNameMap.find(radius => radius.key === authRadiusId)?.value || ''}
            </TenantLink>)
      }
    },
    {
      title: $t({ defaultMessage: 'Accounting Service' }),
      key: 'accountingRadiusId',
      dataIndex: 'accountingRadiusId',
      sorter: false,
      render: (_, { accountingRadiusId }) => {
        return (!accountingRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: accountingRadiusId })}>
              {radiusNameMap.find(radius => radius.key === accountingRadiusId)?.value || ''}
            </TenantLink>)
      }
    },
    {
      key: 'apSerialNumbers',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'apSerialNumbers',
      sorter: true,
      render: (_, row) =>{
        if (row.isDefault) return '-'
        if (!row.apSerialNumbers || row.apSerialNumbers.length === 0) return 0
        return <Tooltip dottedUnderline>{row.apSerialNumbers.length}</Tooltip>
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueIds',
      filterable: venueNameMap,
      sorter: true,
      render: (_, row) =>{
        if (row.isDefault) return '-'
        if (!row.venueIds || row.venueIds.length === 0) return 0
        const venueIds = row.venueIds
        // eslint-disable-next-line max-len
        const filterVenues = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v)
        const tooltipItems = filterVenues.map(v => {
          return $t({ defaultMessage: '{value}' }, { value: v.value })
        })
        return <SimpleListTooltip items={tooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  const rowActions: TableProps<EthernetPortProfileViewData>['rowActions'] = [{
    scopeKey: getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.EDIT),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.EDIT),
    // Default Ethernet Port Profile cannot Edit
    visible: (selectedRows) => selectedRows.length === 1
            && !selectedRows[0].isDefault,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.ETHERNET_PORT_PROFILE,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id
        })
      })
    }
  }, {
    scopeKey: getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.DELETE),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.DELETE),
    // Default Ethernet Port Profile cannot Delete
    visible: (selectedRows) => {
      return !selectedRows.some(row => row.isDefault)
    },
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Profile' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length
        },
        onOk: () => {
          Promise.all(rows.map(row => deleteEthernetPortProfile({ params: { id: row.id } })))
            .then(clearSelection)
        }
      })
    }
  }]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey={(row: EthernetPortProfileViewData) => `${row.id}-${row.name}`}
        columns={columns}
        rowActions={allowedRowActions}
        rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}

export default EthernetPortProfileTable