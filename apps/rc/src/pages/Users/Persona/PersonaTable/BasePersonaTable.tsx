import { useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import { CsvSize, ImportFileDrawer, PersonaGroupSelect }                      from '@acx-ui/rc/components'
import {
  useSearchPersonaListQuery,
  useGetPersonaGroupListQuery,
  useLazyDownloadPersonasQuery,
  useImportPersonasMutation,
  useDeletePersonasMutation
} from '@acx-ui/rc/services'
import { FILTER, Persona, PersonaGroup, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess }                                       from '@acx-ui/user'

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
  const [uploadCsvDrawerVisible, setUploadCsvDrawerVisible] = useState(false)
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as Partial<Persona> | undefined
  })
  const [downloadCsv] = useLazyDownloadPersonasQuery()
  const [uploadCsv, uploadCsvResult] = useImportPersonasMutation()
  const [deletePersonas, { isLoading: isDeletePersonasUpdating }] = useDeletePersonasMutation()

  const personaListQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: personaGroupId
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const toastDetailErrorMessage = (error: any) => {
  //   const subMessages = error.data?.subErrors?.map((e: { message: string }) => e.message)
  //   showToast({
  //     type: 'error',
  //     content: error.data?.message ?? $t({ defaultMessage: 'An error occurred' }),
  //     link: subMessages && { onClick: () => { alert(subMessages.join('\n')) } }
  //   })
  // }

  const importPersonas = async (formData: FormData, values: object) => {
    const { groupId } = values as { groupId: string }
    try {
      await uploadCsv({
        params: { groupId: personaGroupId ?? groupId },
        payload: formData
      }).unwrap()
      setUploadCsvDrawerVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const downloadPersona = () => {
    downloadCsv({
      params: { groupId: personaGroupId },
      payload: personaListQuery.payload
    }).unwrap().catch((error) => {
      console.log(error) // eslint-disable-line no-console
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
          content:
            $t({
              // Display warning while one of the Persona contains devices.
              defaultMessage: `{hasDevices, select,
              true {The Persona contains devices in the MAC registration list.}
              other {}
              }
              Are you sure you want to delete {count, plural,
              one {this}
              other {these}
              } Persona?`
            }, {
              hasDevices: !!selectedItems.find(p => (p?.deviceCount ?? 0) > 0),
              count: selectedItems.length
            }),
          onOk: () => {
            const ids = selectedItems.map(({ id }) => id)
            const names = selectedItems.map(({ name }) => name).join(', ')

            deletePersonas({ payload: ids })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Persona {names} was deleted' }, { names })
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
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: personaGroupId ? 'checkbox' : 'radio' }}
        onFilterChange={handleFilterChange}
      />

      <PersonaDrawer
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        visible={drawerState.visible}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
      />
      <ImportFileDrawer
        title={$t({ defaultMessage: 'Import from file' })}
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        type='Persona'
        acceptType={['csv']}
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
      </ImportFileDrawer>
    </Loader>
  )
}
