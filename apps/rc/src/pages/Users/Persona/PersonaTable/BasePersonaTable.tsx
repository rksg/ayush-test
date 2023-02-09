import { useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableColumn, TableProps }         from '@acx-ui/components'
import { CsvSize, ImportCsvDrawer, PersonaGroupSelect }                               from '@acx-ui/rc/components'
import {
  useSearchPersonaListQuery,
  useGetPersonaGroupListQuery,
  useDeletePersonaMutation, useLazyDownloadPersonasQuery, useImportPersonasMutation
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
      key: 'unit',
      dataIndex: 'unit',
      title: $t({ defaultMessage: 'Unit' })
      // TODO: integrate with Property API to get Unit name
      // ...props.unit
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
  const [uploadCsvDrawerVisible, setUploadCsvDrawerVisible] = useState(false)
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as Partial<Persona> | undefined
  })
  const [downloadCsv] = useLazyDownloadPersonasQuery()
  const [uploadCsv, uploadCsvResult] = useImportPersonasMutation()
  const [deletePersona, { isLoading: isDeletePersonaUpdating }] = useDeletePersonaMutation()

  const personaListQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: personaGroupId ? { groupId: personaGroupId } : { }
  })

  const importPersonas = async (formData: FormData, values: object) => {
    const { groupId } = values as { groupId: string }
    try {
      await uploadCsv({
        params: { groupId: personaGroupId ?? groupId },
        payload: formData
      }).unwrap()
      setUploadCsvDrawerVisible(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.data?.message) {
        showToast({
          type: 'error',
          content: error.data.message
        })
      }
    }
  }

  const downloadPersona = () => {
    downloadCsv({
      params: { groupId: personaGroupId },
      payload: personaListQuery.payload
    }).unwrap().catch(() => {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Failed to export Personas.' })
      })
    })
  }

  const actions: TableProps<PersonaGroup>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Persona' }),
      onClick: () => {
        // if user is under PersonaGroup page, props groupId into Drawer
        setDrawerState({ isEdit: false, visible: true, data: { groupId: personaGroupId } })
      }
    },
    {
      label: $t({ defaultMessage: 'Import From File' }),
      onClick: () => setUploadCsvDrawerVisible(true)
    },
    {
      label: $t({ defaultMessage: 'Export To File' }),
      onClick: downloadPersona
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
        { isLoading: false, isFetching: isDeletePersonaUpdating }
      ]}
    >
      <Table
        columns={columns}
        dataSource={personaListQuery.data?.data}
        pagination={personaListQuery.pagination}
        onChange={personaListQuery.handleTableChange}
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
      <ImportCsvDrawer
        title={$t({ defaultMessage: 'Import from file' })}
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        type='Persona'
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        templateLink='assets/templates/persona_import_template.csv'
        importRequest={importPersonas}
        onClose={() => setUploadCsvDrawerVisible(false)}
      >
        <Form.Item
          name='groupId'
          rules={[{ required: true }]}
          initialValue={personaGroupId}
          label={$t({ defaultMessage: 'Persona Group' })}
        >
          <PersonaGroupSelect disabled={!!personaGroupId}/>
        </Form.Item>
      </ImportCsvDrawer>
    </Loader>
  )
}
