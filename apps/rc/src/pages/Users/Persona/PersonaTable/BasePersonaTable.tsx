import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import {
  useSearchPersonaListQuery,
  useGetPersonaGroupListQuery,
  useDeletePersonaMutation
} from '@acx-ui/rc/services'
import {  Persona, PersonaGroup, useTableQuery } from '@acx-ui/rc/utils'

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
      sorter: true,
      align: 'center',
      ...props.deviceCount
    },
    {
      key: 'groupId',
      dataIndex: 'groupId',
      title: $t({ defaultMessage: 'Persona Group' }),
      sorter: true,
      render: (_, row) => {
        const name = personaGroupList.data?.data.find(group => group.id === row.groupId)?.name
        return <PersonaGroupLink personaGroupId={row.groupId} name={name} />
      },
      ...props.groupId
    },
    {
      key: 'vlan',
      dataIndex: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      ...props.vlan
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
  const hasGroupId = () => personaGroupId !== undefined
  const columns = useColumns(colProps)
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as Partial<Persona> | undefined
  })
  const [deletePersona, { isLoading: isDeletePersonaUpdating }] = useDeletePersonaMutation()

  const personaListQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { }
  })

  const personaListByGroupIdQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { groupId: personaGroupId }
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
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, groupId, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Persona' }),
            entityValue: name
          },
          onOk: () => {
            deletePersona({ params: { groupId, id } })
              .unwrap()
              .then(() => clearSelection())
              .catch(error => {
                showToast({
                  type: 'error',
                  content: $t({ defaultMessage: 'An error occurred' }),
                  // FIXME: Correct the error message
                  link: { onClick: () => alert(JSON.stringify(error)) }
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
        personaListQuery,
        personaListByGroupIdQuery,
        { isLoading: false, isFetching: isDeletePersonaUpdating }
      ]}
    >
      <Table
        columns={columns}
        dataSource={
          hasGroupId()
            ? personaListByGroupIdQuery.data?.data
            : personaListQuery.data?.data
        }
        pagination={
          hasGroupId()
            ? personaListByGroupIdQuery.pagination
            : personaListQuery.pagination
        }
        onChange={
          hasGroupId()
            ? personaListByGroupIdQuery.handleTableChange
            : personaListQuery.handleTableChange
        }
        rowKey='id'
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
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
