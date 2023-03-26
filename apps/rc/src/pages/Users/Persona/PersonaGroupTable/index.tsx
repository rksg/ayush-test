import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import {
  useSearchPersonaGroupListQuery,
  useLazyGetMacRegListQuery,
  useDeletePersonaGroupMutation,
  useLazyGetDpskQuery,
  useLazyVenuesListQuery,
  useGetDpskListQuery,
  useMacRegListsQuery,
  useGetNetworkSegmentationGroupListQuery,
  useLazyDownloadPersonaGroupsQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery
} from '@acx-ui/rc/services'
import { FILTER, PersonaGroup, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess }                              from '@acx-ui/user'

import {
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupLink,
  VenueLink
} from '../LinkHelper'
import { PersonaGroupDrawer } from '../PersonaGroupDrawer'



function useColumns (
  macRegistrationPools: Map<string, string>,
  dpskPools: Map<string, string>,
  venuesMap: Map<string, string>,
  nsgMap: Map<string, string>
) {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)

  const { data: dpskPool } = useGetDpskListQuery({})
  const { data: macList } = useMacRegListsQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  })
  const { data: nsgList } = useGetNetworkSegmentationGroupListQuery(
    { params: { page: '1', pageSize: '10000', sort: 'name,asc' } },
    { skip: !networkSegmentationEnabled }
  )

  const columns: TableProps<PersonaGroup>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Persona Group' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) =>
        <PersonaGroupLink
          name={row.name}
          personaGroupId={row.id}
        />
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: false
    },
    {
      key: 'propertyId',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'propertyId',
      render: (_, row) =>
        <VenueLink
          // FIXME: After the property id does not present in UUID format, I will remove .replace()
          name={venuesMap.get(row?.propertyId?.replaceAll('-', '') ?? '')}
          venueId={row?.propertyId}
        />
    },
    {
      key: 'dpskPoolId',
      title: $t({ defaultMessage: 'DPSK Pool' }),
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
    {
      key: 'nsgId',
      title: $t({ defaultMessage: 'Network Segmentation' }),
      dataIndex: 'nsgId',
      sorter: true,
      filterMultiple: false,
      filterable: nsgList?.data.map(nsg => ({ key: nsg.id, value: nsg.name })) ?? [],
      render: (_, row) =>
        <NetworkSegmentationLink
          nsgId={row.nsgId}
          name={nsgMap.get(row.nsgId ?? '')}
        />
    },
    {
      key: 'personaCount',
      title: $t({ defaultMessage: 'Personas' }),
      dataIndex: 'personaCount',
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

  const [getVenues] = useLazyVenuesListQuery()
  const [getDpskById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getNsgById] = useLazyGetNetworkSegmentationGroupByIdQuery()
  const [downloadCsv] = useLazyDownloadPersonaGroupsQuery()
  const [
    deletePersonaGroup,
    { isLoading: isDeletePersonaGroupUpdating }
  ] = useDeletePersonaGroupMutation()

  const tableQuery = useTableQuery( {
    useQuery: useSearchPersonaGroupListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { keyword: '' }
  })

  useEffect(() => {
    if (tableQuery.isLoading) return

    const venueIds: string[] = []
    const macPools = new Map()
    const dpskPools = new Map()
    const nsgPools = new Map()

    tableQuery.data?.data.forEach(personaGroup => {
      const { macRegistrationPoolId, dpskPoolId, propertyId, nsgId } = personaGroup

      if (propertyId) {
        // FIXME: After the property id does not present in UUID format, I will remove .replace()
        venueIds.push(propertyId.replaceAll('-', ''))
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

      if (nsgId) {
        getNsgById({ params: { tenantId, serviceId: nsgId } })
          .then(result => {
            if (result.data) {
              nsgPools.set(nsgId, result.data.name)
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

  const actions: TableProps<PersonaGroup>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Persona Group' }),
      onClick: () => {
        setDrawerState({ isEdit: false, visible: true, data: undefined })
      }
    },
    {
      label: $t({ defaultMessage: 'Export To File' }),
      onClick: downloadPersonaGroups
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
        (selectedItem && selectedItem.personaCount)
          ? selectedItem.personaCount > 0 : false
      ),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Persona Group' }),
            entityValue: name
          },
          onOk: () => {
            deletePersonaGroup({ params: { groupId: id } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Persona Group {name} was deleted' }, { name })
                })
                clearSelection()
              })
              .catch((error) => {
                console.log(error) // eslint-disable-line no-console
              })
          }
        })
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
      nsgId: Array.isArray(customFilters?.nsgId) ? customFilters?.nsgId[0] : undefined
    }

    tableQuery.setPayload(payload)
  }

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeletePersonaGroupUpdating }
      ]}
    >
      <Table
        enableApiFilter
        columns={useColumns(macRegistrationPoolMap, dpskPoolMap, venueMap, nsgPoolMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'radio' }}
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
