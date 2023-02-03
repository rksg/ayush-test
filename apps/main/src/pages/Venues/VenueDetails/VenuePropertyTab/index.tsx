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
import { PropertyDpskType, PropertyUnit, PropertyUnitStatus, useTableQuery } from '@acx-ui/rc/utils'

import { PropertyUnitDrawer } from './PropertyUnitDrawer'


export function VenuePropertyTab () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  // FIXME: default = false
  const [withNsg, setWithNsg] = useState(true)
  const [drawerState, setDrawerState] = useState<{
    isEdit: boolean,
    visible: boolean,
    data?: PropertyUnit
  }>({
    isEdit: false,
    visible: false
  })

  const [deleteUnitByIds] = useDeletePropertyUnitsMutation()
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [getPersonaGroupById, state] = useLazyGetPersonaGroupByIdQuery()

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
      onClick: () => setDrawerState({ isEdit: false, visible: true, data: undefined })
    }
  ]

  const rowActions: TableProps<PropertyUnit>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length <= 1),
      onClick: ([data], clearSelection) => {
        setDrawerState({ data, isEdit: true, visible: true })
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
      onClick: ([data], clearSelection) => {
        // TODO: View Portal Action implementation
        console.log('[View Portal] :: ', data.name)
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
              .catch(() => {
                showToast({
                  type: 'error',
                  content: $t({ defaultMessage: 'An error occurred' })
                })
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
      dataIndex: ['personaSettings', 'accessPoint'],
      // FIXME: fetch AP by macAddress?
      render: (_, row) => row.personaSettings?.accessPoint.name
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

  // FIXME: API integration with Get Unit List
  const mockPropertyUnit: PropertyUnit[] = [
    {
      id: 'unit-id-A',
      name: 'Unit A',
      dpsks: [
        {
          type: PropertyDpskType.UNIT,
          passphrase: 'AA unit passphrase',
          vlan: 100,
          status: 'CREATED'
        },
        {
          type: PropertyDpskType.GUEST,
          passphrase: 'AA guest passphrase',
          vlan: 1000,
          status: 'CREATED'
        }
      ],
      resident: {
        name: 'AA Resident name',
        email: 'AA resident@commscope.com',
        phoneNumber: 'AA xxx-xxx-xxxx'
      },
      status: PropertyUnitStatus.ENABLED
    },
    {
      id: 'unit-id-b',
      name: 'Unit B',
      dpsks: [
        {
          type: PropertyDpskType.UNIT,
          passphrase: 'BB unit passphrase',
          vlan: 600,
          status: 'CREATED'
        },
        {
          type: PropertyDpskType.GUEST,
          passphrase: 'BB guest passphrase',
          status: 'CREATED'
        }
      ],
      resident: {
        name: 'BB Resident name',
        email: 'BB resident@commscope.com',
        phoneNumber: 'BB xxx-xxx-xxxx'
      },
      status: PropertyUnitStatus.ENABLED
    }
  ]

  return (
    <Loader
      // FIXME: queryUnitList need to be added into states
      states={[
        { isFetching: propertyConfigsQuery.isFetching, isLoading: false },
        { isFetching: state.isFetching, isLoading: false }
      ]}
    >
      <Table
        rowKey='name'
        columns={columns}
        dataSource={queryUnitList.data?.data || mockPropertyUnit}
        pagination={queryUnitList.pagination}
        onChange={queryUnitList.handleTableChange}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
      <PropertyUnitDrawer
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        visible={drawerState.visible}
        withNsg={withNsg}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
      />
    </Loader>
  )
}
