import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import {
  useDeletePropertyUnitsMutation,
  useGetPropertyConfigsQuery,
  useGetPropertyUnitListQuery,
  useLazyGetPersonaGroupByIdQuery,
  useUpdatePropertyUnitMutation
} from '@acx-ui/rc/services'
import { PropertyUnit, PropertyUnitStatus, useTableQuery } from '@acx-ui/rc/utils'

import { PropertyUnitDrawer } from './PropertyUnitDrawer'


export function VenuePropertyTab () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const [withNsg, setWithNsg] = useState(false)
  const [drawerState, setDrawerState] = useState<{
    isEdit: boolean,
    visible: boolean,
    unitId?: string
  }>({
    isEdit: false,
    visible: false
  })

  const [deleteUnitByIds] = useDeletePropertyUnitsMutation()
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [getPersonaGroupById, personaGroupQuery] = useLazyGetPersonaGroupByIdQuery()

  useEffect(() => {
    if (propertyConfigsQuery.isLoading) return
    if (!propertyConfigsQuery.data?.personaGroupId) return

    getPersonaGroupById({ params: { groupId: propertyConfigsQuery.data.personaGroupId } })
      .then(result => setWithNsg(!!result.data?.nsgId))
  }, [propertyConfigsQuery.data])

  const queryUnitList = useTableQuery({
    useQuery: useGetPropertyUnitListQuery,
    defaultPayload: {}
  })

  const actions: TableProps<PropertyUnit>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Unit' }),
      onClick: () => setDrawerState({ isEdit: false, visible: true, unitId: undefined })
    }
  ]

  const rowActions: TableProps<PropertyUnit>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length <= 1),
      onClick: ([{ id }], clearSelection) => {
        setDrawerState({ unitId: id, isEdit: true, visible: true })
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Suspend' }),
      onClick: (items, clearSelection) => {
        items.forEach(unit => {
          updateUnitById({
            params: { venueId, unitId: unit.id },
            payload: { status: PropertyUnitStatus.DISABLED }
          })
            .then(clearSelection)
        })
      }
    },
    {
      label: $t({ defaultMessage: 'View Portal' }),
      visible: (selectedItems => selectedItems.length <= 1),
      onClick: (_, clearSelection) => {
        // TODO: View Portal Action implementation
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        const ids = selectedItems.map(i => i.id)
        const names = selectedItems.map(i => i.name).join(', ')

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Unit' }),
            entityValue: selectedItems[0].name,
            numOfEntities: selectedItems.length
          },
          onOk: () => {
            deleteUnitByIds({ params: { venueId }, payload: ids })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Unit {names} was deleted' }, { names })
                })
                clearSelection()
              })
              .catch((e) => {
                console.log(e) // eslint-disable-line no-console
              })
          }
        })
      }
    }
  ]

  const columns: TableProps<PropertyUnit>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Unit Name' }),
      dataIndex: 'name',
      searchable: true
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status'
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      align: 'center'
    },
    {
      show: withNsg,
      key: 'accessPoint',
      title: $t({ defaultMessage: 'Access Point' }),
      dataIndex: ['accessPoint'],
      // FIXME: fetch AP by macAddress?
      render: (_, row) => row?.accessPoint?.name
    },
    {
      show: withNsg,
      key: 'switchPorts',
      title: $t({ defaultMessage: 'Switch Ports' }),
      dataIndex: ['personaSettings', 'accessPoint']
    },
    {
      key: 'residentName',
      title: $t({ defaultMessage: 'Resident Name' }),
      dataIndex: ['resident', 'name']
    },
    {
      key: 'residentEmail',
      title: $t({ defaultMessage: 'Resident Email' }),
      dataIndex: ['resident', 'email']
    },
    {
      key: 'residentPhone',
      title: $t({ defaultMessage: 'Resident Phone' }),
      dataIndex: ['resident', 'phoneNumber']
    }
  ]

  return (
    <Loader
      states={[
        queryUnitList,
        { isFetching: propertyConfigsQuery.isFetching, isLoading: false },
        { isFetching: personaGroupQuery.isFetching, isLoading: false }
      ]}
    >
      <Table
        rowKey='name'
        columns={columns}
        dataSource={queryUnitList.data?.data}
        pagination={queryUnitList.pagination}
        onChange={queryUnitList.handleTableChange}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
      {venueId &&
        <PropertyUnitDrawer
          venueId={venueId}
          unitId={drawerState?.unitId}
          isEdit={drawerState.isEdit}
          visible={drawerState.visible}
          onClose={() => setDrawerState({ isEdit: false, visible: false, unitId: undefined })}
        />
      }
    </Loader>
  )
}
