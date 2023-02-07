import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import {
  useSearchPersonaGroupListQuery,
  useLazyGetMacRegListQuery,
  useDeletePersonaGroupMutation,
  useLazyGetDpskQuery,
  useLazyVenuesListQuery
} from '@acx-ui/rc/services'
import { PersonaGroup, useTableQuery } from '@acx-ui/rc/utils'

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
  venuesMap: Map<string, string>
) {
  const { $t } = useIntl()

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
      filterable: true,
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
      filterable: true,
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
      filterable: true,
      render: (_, row) =>
        <NetworkSegmentationLink
          nsgId={row.nsgId}
          name={row.nsgId}
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
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as PersonaGroup | undefined
  })

  const [getVenues] = useLazyVenuesListQuery()
  const [getDpskById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [
    deletePersonaGroup,
    { isLoading: isDeletePersonaGroupUpdating }
  ] = useDeletePersonaGroupMutation()

  const tableQuery = useTableQuery( {
    useQuery: useSearchPersonaGroupListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { }
  })

  useEffect(() => {
    if (tableQuery.isLoading) return

    const venueIds: string[] = []
    const macPools = new Map()
    const dpskPools = new Map()

    tableQuery.data?.data.forEach(personaGroup => {
      const { macRegistrationPoolId, dpskPoolId, propertyId } = personaGroup

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
  }, [tableQuery.data])

  const actions: TableProps<PersonaGroup>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Persona Group' }),
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
                showToast({
                  type: 'error',
                  content: error.data.message
                })
              })
          }
        })
      }
    }
  ]

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeletePersonaGroupUpdating }
      ]}
    >
      <Table
        columns={useColumns(macRegistrationPoolMap, dpskPoolMap, venueMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        actions={actions}
        rowActions={rowActions}
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
