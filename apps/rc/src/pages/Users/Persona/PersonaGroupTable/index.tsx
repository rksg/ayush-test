import { useEffect, useState, useContext } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import { TierFeatures, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import { DownloadOutlined }                                  from '@acx-ui/icons'
import {
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  IdentityGroupLink,
  VenueLink,
  PersonaGroupDrawer,
  usePersonaAsyncHeaders
} from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeletePersonaGroupMutation,
  useGetEnhancedDpskListQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetQueriablePropertyConfigsQuery,
  useLazyDownloadPersonaGroupsQuery,
  useLazyGetDpskQuery,
  useLazyGetMacRegListQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery,
  useLazyVenuesListQuery,
  useSearchMacRegListsQuery,
  useSearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import { FILTER, PersonaGroup, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                   from '@acx-ui/user'
import { exportMessageMapping }                        from '@acx-ui/utils'

import { IdentityGroupContext } from '..'

const propertyConfigDefaultPayload = {
  sortField: 'venueName',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 100
}

const macRegSearchDefaultPayload = {
  dataOption: 'all',
  searchCriteriaList: [
    {
      filterKey: 'name',
      operation: 'cn',
      value: ''
    }
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

function useColumns (
  macRegistrationPools: Map<string, string>,
  dpskPools: Map<string, string>,
  venuesMap: Map<string, string>,
  nsgMap: Map<string, string>
) {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)

  const { data: dpskPool } = useGetEnhancedDpskListQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  })
  const { data: macList } = useSearchMacRegListsQuery({ payload: macRegSearchDefaultPayload })
  const { data: nsgList } = useGetNetworkSegmentationViewDataListQuery(
    {
      payload: {
        page: 1,
        pageSize: 10000,
        fields: ['name', 'id'],
        sortField: 'name',
        sortOrder: 'ASC'
      }
    },
    { skip: !networkSegmentationEnabled }
  )
  const { venueOptions, isVenueOptionsLoading } = useGetQueriablePropertyConfigsQuery({
    payload: propertyConfigDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isVenueOptionsLoading: isLoading,
        venueOptions: data?.data.map(item => ({ value: item.venueName!, key: item.venueId! })) ?? []
      }
    }
  })

  const columns: TableProps<PersonaGroup>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Identity Group' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) =>
        <IdentityGroupLink
          name={row.name}
          personaGroupId={row.id}
        />
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true,
      searchable: true
    },
    {
      key: 'propertyId',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'propertyId',
      sorter: true,
      filterMultiple: false,
      filterable: isVenueOptionsLoading ? [] : venueOptions,
      render: (_, row) =>
        <VenueLink
          name={venuesMap.get(row?.propertyId ?? '')}
          venueId={row?.propertyId}
        />
    },
    {
      key: 'dpskPoolId',
      title: $t({ defaultMessage: 'DPSK Service' }),
      dataIndex: 'dpskPoolId',
      sorter: true,
      filterMultiple: false,
      filterable: dpskPool?.data.map(pool => ({ key: pool.id!!, value: pool.name })) ?? [],
      render: (_, row) =>
        <DpskPoolLink
          name={dpskPools.get(row.dpskPoolId ?? '')}
          dpskPoolId={row.dpskPoolId}
        />
    },
    {
      key: 'macRegistrationPoolId',
      title: $t({ defaultMessage: 'Mac Registration List' }),
      dataIndex: 'macRegistrationPoolId',
      sorter: true,
      filterMultiple: false,
      filterable: macList?.data.map(mac => ({ key: mac.id!!, value: mac.name })) ?? [],
      render: (_, row) =>
        <MacRegistrationPoolLink
          name={macRegistrationPools.get(row.macRegistrationPoolId ?? '')}
          macRegistrationPoolId={row.macRegistrationPoolId}
        />
    },
    ...(networkSegmentationEnabled ? [{
      key: 'personalIdentityNetworkId',
      title: $t({ defaultMessage: 'Personal Identity Network' }),
      dataIndex: 'personalIdentityNetworkId',
      sorter: true,
      filterMultiple: false,
      filterable: nsgList?.data.map(nsg => ({ key: nsg.id, value: nsg.name })) ?? [],
      render: (_, row) =>
        <NetworkSegmentationLink
          id={row.personalIdentityNetworkId}
          name={nsgMap.get(row.personalIdentityNetworkId ?? '')}
        />
    } as TableColumn<PersonaGroup>] : []),
    {
      key: 'identityCount',
      title: $t({ defaultMessage: 'Identities' }),
      dataIndex: 'identityCount',
      align: 'center'
    }
  ]

  return columns
}

const defaultVenueListPayload = {
  fields: [
    'id',
    'name'
  ],
  filters: { id: [] }
}

export function PersonaGroupTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [venueMap, setVenueMap] = useState(new Map())
  const [macRegistrationPoolMap, setMacRegistrationPoolMap] = useState(new Map())
  const [dpskPoolMap, setDpskPoolMap] = useState(new Map())
  const [nsgPoolMap, setNsgPoolMap] = useState(new Map())
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as PersonaGroup | undefined
  })
  const { setIdentityGroupCount } = useContext(IdentityGroupContext)
  const { isAsync, customHeaders } = usePersonaAsyncHeaders()

  const [getVenues] = useLazyVenuesListQuery()
  const [getDpskById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getNsgById] = useLazyGetNetworkSegmentationGroupByIdQuery()
  const [downloadCsv] = useLazyDownloadPersonaGroupsQuery()
  const [
    deletePersonaGroup,
    { isLoading: isDeletePersonaGroupUpdating }
  ] = useDeletePersonaGroupMutation()

  const settingsId = 'persona-group-table'
  const tableQuery = useTableQuery( {
    useQuery: useSearchPersonaGroupListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { keyword: '' },
    pagination: { settingsId }
  })

  useEffect(() => {
    if (tableQuery.isLoading) return

    const venueIds: string[] = []
    const macPools = new Map()
    const dpskPools = new Map()
    const nsgPools = new Map()

    tableQuery.data?.data.forEach(personaGroup => {
      const {
        macRegistrationPoolId,
        dpskPoolId,
        propertyId,
        personalIdentityNetworkId
      } = personaGroup

      if (propertyId) {
        venueIds.push(propertyId)
      }

      if (macRegistrationPoolId) {
        getMacRegistrationById({ params: { policyId: macRegistrationPoolId } })
          .then(result => {
            if (result.data) {
              macPools.set(macRegistrationPoolId, result.data.name)
            }
          })
      }

      if (dpskPoolId) {
        getDpskById({ params: { serviceId: dpskPoolId } })
          .then(result => {
            if (result.data) {
              dpskPools.set(dpskPoolId, result.data.name)
            }
          })
      }

      if (personalIdentityNetworkId) {
        getNsgById({ params: { tenantId, serviceId: personalIdentityNetworkId } })
          .then(result => {
            if (result.data) {
              nsgPools.set(personalIdentityNetworkId, result.data.name)
            }
          })
      }
    })

    if (venueIds.length !== 0) {
      const payload = { ...defaultVenueListPayload, filters: { id: venueIds } }
      getVenues({ params: { tenantId }, payload })
        .then(result => {
          if (result?.data?.data) {
            setVenueMap(new Map(result.data.data.map(v => [v.id, v.name])))
          }
        })
    }

    setDpskPoolMap(dpskPools)
    setMacRegistrationPoolMap(macPools)
    setNsgPoolMap(nsgPools)
  }, [tableQuery.data])

  const downloadPersonaGroups = () => {
    downloadCsv({ payload: tableQuery.payload }).unwrap().catch((error) => {
      console.log(error) // eslint-disable-line no-console
    })
  }

  const doDelete = (selectedRow: PersonaGroup, callback: () => void) => {
    const { id, name } = selectedRow
    doProfileDelete(
      [selectedRow],
      $t({ defaultMessage: 'Identity Group' }),
      name,
      [
        {
          fieldName: 'personalIdentityNetworkId',
          fieldText: $t({ defaultMessage: 'Personal Identity Network' })
        },
        // eslint-disable-next-line max-len
        { fieldName: 'propertyId', fieldText: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }) }
      ],
      async () => deletePersonaGroup({ params: { groupId: id }, customHeaders })
        .then(() => {
          if (!isAsync) {
            showToast({
              type: 'success',
              content: $t({ defaultMessage: 'Identity Group {name} was deleted' }, { name })
            })
          }
          callback()
        })
    )
  }

  const actions: TableProps<PersonaGroup>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Identity Group' }),
      onClick: () => {
        setDrawerState({ isEdit: false, visible: true, data: undefined })
      }
    }
  ]

  const rowActions: TableProps<PersonaGroup>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data], clearSelection) => {
        setDrawerState({ data, isEdit: true, visible: true })
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: (([selectedItem]) =>
        (selectedItem && selectedItem.identityCount)
          ? selectedItem.identityCount > 0 : false
      ),
      onClick: ([selectedRow], clearSelection) => {
        doDelete(selectedRow, clearSelection)
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      keyword: customSearch?.searchString ?? '',
      dpskPoolId: Array.isArray(customFilters?.dpskPoolId)
        ? customFilters?.dpskPoolId[0] : undefined,
      macRegistrationPoolId: Array.isArray(customFilters?.macRegistrationPoolId)
        ? customFilters?.macRegistrationPoolId[0] : undefined,
      personalIdentityNetworkId: Array.isArray(customFilters?.personalIdentityNetworkId)
        ? customFilters?.personalIdentityNetworkId[0] : undefined,
      propertyId: Array.isArray(customFilters?.propertyId)
        ? customFilters?.propertyId[0] : undefined
    }

    tableQuery.setPayload(payload)
  }

  setIdentityGroupCount?.(tableQuery.data?.totalCount || 0)
  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeletePersonaGroupUpdating }
      ]}
    >
      <Table<PersonaGroup>
        enableApiFilter
        settingsId={settingsId}
        columns={useColumns(macRegistrationPoolMap, dpskPoolMap, venueMap, nsgPoolMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'radio' }}
        iconButton={{
          icon: <DownloadOutlined data-testid={'export-persona-group'} />,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: downloadPersonaGroups
        }}
      />

      <PersonaGroupDrawer
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        visible={drawerState.visible}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
      />
    </Loader>
  )
}
