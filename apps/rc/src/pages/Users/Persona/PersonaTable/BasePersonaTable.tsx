import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import {
  useSearchPersonaListQuery,
  useGetPersonaGroupListQuery,
  useDeletePersonasMutation
} from '@acx-ui/rc/services'
import { FILTER, Persona, PersonaGroup, SEARCH, useTableQuery } from '@acx-ui/rc/utils'

import { PersonaDetailsLink, PersonaGroupLink } from '../LinkHelper'
import { PersonaDrawer }                        from '../PersonaDrawer'



function useColumns (props: PersonaTableColProps) {
  const { $t } = useIntl()

  const personaGroupList = useGetPersonaGroupListQuery({
    params: { size: '2147483647', page: '0' }
  })

  const columns: TableProps<Persona>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'Persona Name' }),
      render: (_, row) =>
        <PersonaDetailsLink
          name={row.name}
          personaId={row.id}
          personaGroupId={row.groupId}
        />
      ,
      sorter: true,
      ...props.name
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: $t({ defaultMessage: 'Email' }),
      sorter: false,
      ...props.email
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: $t({ defaultMessage: 'Description' }),
      sorter: false,
      ...props.description
    },
    {
      key: 'deviceCount',
      dataIndex: 'deviceCount',
      title: $t({ defaultMessage: 'Devices' }),
      align: 'center',
      ...props.deviceCount
    },
    {
      key: 'unit',
      dataIndex: 'unit',
      title: $t({ defaultMessage: 'Unit' })
      // TODO: integrate with Property API to get Unit name
      // ...props.unit
    },
    {
      key: 'groupId',
      dataIndex: 'group',
      title: $t({ defaultMessage: 'Persona Group' }),
      sorter: true,
      render: (_, row) => {
        const name = personaGroupList.data?.data.find(group => group.id === row.groupId)?.name
        return <PersonaGroupLink personaGroupId={row.groupId} name={name} />
      },
      filterMultiple: false,
      filterable: personaGroupList?.data?.data.map(pg => ({ key: pg.id, value: pg.name })) ?? [],
      ...props.groupId
    },
    {
      key: 'vlan',
      dataIndex: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      ...props.vlan
    },
    {
      key: 'assignedAp',
      dataIndex: 'assignedAp',
      title: $t({ defaultMessage: 'Assigned AP' }),
      // render: (_, row) => {
      // TODO: fetch AP info by MacAddress?
      // },
      ...props.ethernetPorts
    },
    {
      key: 'ethernetPorts',
      dataIndex: 'ethernetPorts',
      title: $t({ defaultMessage: 'Assigned Port' }),
      render: (_, row) => {
        return row.ethernetPorts?.map(port => `LAN ${port.portIndex}`).join(', ')
      },
      ...props.ethernetPorts
    },
    {
      key: 'vni',
      dataIndex: 'vni',
      title: $t({ defaultMessage: 'VNI' }),
      ...props.vni
    }
  ]

  return columns
}

interface PersonaTableCol extends
  Pick<TableColumn<Persona>, 'filterable' | 'searchable' | 'show'> {}

type PersonaTableColProps = {
  [key in keyof Persona]?: PersonaTableCol
}
export interface PersonaTableProps {
  colProps: PersonaTableColProps
}

export function BasePersonaTable (props: PersonaTableProps) {
  const { $t } = useIntl()
  const { colProps } = props
  const { personaGroupId } = useParams()
  const columns = useColumns(colProps)
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as Partial<Persona> | undefined
  })
  const [deletePersonas, { isLoading: isDeletePersonasUpdating }] = useDeletePersonasMutation()

  const personaListQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: personaGroupId
    }
  })

  const actions: TableProps<PersonaGroup>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Persona' }),
      onClick: () => {
        // if user is under PersonaGroup page, props groupId into Drawer
        setDrawerState({ isEdit: false, visible: true, data: { groupId: personaGroupId } })
      }
    }
  ]

  const rowActions: TableProps<Persona>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data], clearSelection) => {
        setDrawerState({ data, isEdit: true, visible: true })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Persona' }),
            entityValue: selectedItems[0].name,
            numOfEntities: selectedItems.length
          },
          onOk: () => {
            const ids = selectedItems.map(({ id }) => id)
            const names = selectedItems.map(({ name }) => name).join(', ')

            deletePersonas({ payload: { ids } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Persona {names} was deleted' }, { names })
                })
                clearSelection()
              })
              .catch((e) => {
                showToast({
                  type: 'error',
                  content: $t(
                    { defaultMessage: 'An error occurred {detail}' },
                    { detail: e?.data?.message ?? undefined }
                  )
                })
              })
          }
        })
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...personaListQuery.payload,
      keyword: customSearch?.searchString ?? '',
      propertyId: Array.isArray(customFilters?.propertyId)
        ? customFilters?.propertyId[0]
        : undefined
    }

    // Do not support group filter while user in the PersonaDetail page
    personaGroupId
      ? Object.assign(payload, { groupId: personaGroupId })
      : Object.assign(payload, { groupId: Array.isArray(customFilters.group)
        ? customFilters.group[0] : undefined })

    personaListQuery.setPayload(payload)
  }

  return (
    <Loader
      states={[
        personaListQuery,
        { isLoading: false, isFetching: isDeletePersonasUpdating }
      ]}
    >
      <Table
        enableApiFilter
        columns={columns}
        dataSource={personaListQuery.data?.data}
        pagination={personaListQuery.pagination}
        onChange={personaListQuery.handleTableChange}
        rowKey='id'
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: personaGroupId ? 'checkbox' : 'radio' }}
        onFilterChange={handleFilterChange}
      />

      <PersonaDrawer
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        visible={drawerState.visible}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
      />
    </Loader>
  )
}
