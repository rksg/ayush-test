import { useContext, useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import { Features, useIsTierAllowed }                                         from '@acx-ui/feature-toggle'
import { DownloadOutlined }                                                   from '@acx-ui/icons'
import {
  CsvSize,
  ImportFileDrawer,
  PersonaGroupSelect,
  PersonaDetailsLink,
  PersonaGroupLink,
  PropertyUnitLink,
  ImportFileDrawerType
} from '@acx-ui/rc/components'
import {
  useSearchPersonaListQuery,
  useGetPersonaGroupListQuery,
  useLazyDownloadPersonasQuery,
  useImportPersonasMutation,
  useDeletePersonasMutation,
  useLazyGetPropertyUnitByIdQuery,
  useGetPersonaGroupByIdQuery,
  useLazyGetDpskPassphraseDevicesQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  Persona,
  PersonaErrorResponse,
  PersonaGroup,
  SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { PersonasContext }    from '..'
import { PersonaDrawer }      from '../PersonaDrawer'
import { PersonaBlockedIcon } from '../styledComponents'

function useColumns (
  props: PersonaTableColProps,
  unitPool: Map<string, string>,
  venueId: string,
  dpskDeviceCount: Map<string, number>
) {
  const { $t } = useIntl()

  const personaGroupList = useGetPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 2147483647, sortField: 'name', sortOrder: 'ASC'
    }
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
      key: 'revoked',
      dataIndex: 'revoked',
      title: $t({ defaultMessage: 'Blocked' }),
      align: 'center',
      sorter: true,
      render: (_, row) => row.revoked && <PersonaBlockedIcon />,
      ...props.revoked
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: $t({ defaultMessage: 'Email' }),
      sorter: true,
      ...props.email
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: $t({ defaultMessage: 'Description' }),
      sorter: true,
      ...props.description
    },
    ...(props.deviceCount?.disable)
      ? []
      : [{
        key: 'deviceCount',
        dataIndex: 'deviceCount',
        title: $t({ defaultMessage: 'Devices' }),
        align: 'center',
        render: (_, row) => {
          const dpskGuid = row.dpskGuid
          const count = dpskDeviceCount.get(dpskGuid ?? '') ?? 0
          return (row?.deviceCount ?? 0) + count
        },
        ...props.deviceCount
      } as TableColumn<Persona>],
    ...(props.identityId?.disable)
      ? []
      : [{
        key: 'identityId',
        dataIndex: 'identityId',
        title: $t({ defaultMessage: 'Unit' }),
        sorter: true,
        render: (_, row) =>
          <PropertyUnitLink
            venueId={venueId}
            unitId={row.identityId}
            name={unitPool.get(row.identityId ?? '')}
          />
        ,
        ...props.identityId
      } as TableColumn<Persona>],
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
      sorter: true,
      ...props.vlan
    },
    {
      key: 'assignedAp',
      dataIndex: 'assignedAp',
      title: $t({ defaultMessage: 'Assigned AP' }),
      render: (_, row) => {
      // TODO: fetch AP info by MacAddress?
        return row?.ethernetPorts?.[0]?.name
      },
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
      title: $t({ defaultMessage: 'Segment No.' }),
      sorter: true,
      ...props.vni
    }
  ]

  return columns
}

interface PersonaTableCol extends
  Pick<TableColumn<Persona>, 'filterable' | 'searchable' | 'show' | 'disable'> {}

type PersonaTableColProps = {
  [key in keyof Persona]?: PersonaTableCol
}
export interface PersonaTableProps {
  personaGroupId?: string,
  colProps: PersonaTableColProps
}

export function BasePersonaTable (props: PersonaTableProps) {
  const { $t } = useIntl()
  const { personaGroupId, colProps } = props
  const { tenantId } = useParams()
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const [venueId, setVenueId] = useState('')
  const [unitPool, setUnitPool] = useState(new Map())
  const [dpskDeviceCount, setDpskDeviceCount] = useState(new Map<string, number>())
  const columns = useColumns(colProps, unitPool, venueId, dpskDeviceCount)
  const [uploadCsvDrawerVisible, setUploadCsvDrawerVisible] = useState(false)
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as Partial<Persona> | undefined
  })
  const [downloadCsv] = useLazyDownloadPersonasQuery()
  const [uploadCsv, uploadCsvResult] = useImportPersonasMutation()
  const [deletePersonas, { isLoading: isDeletePersonasUpdating }] = useDeletePersonasMutation()
  const personaGroupQuery = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    { skip: !personaGroupId }
  )
  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const { setPersonasCount } = useContext(PersonasContext)

  const personaListQuery = useTableQuery<Persona>({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: personaGroupId
    }
  })

  const [getDpskDevices] = useLazyGetDpskPassphraseDevicesQuery()

  useEffect(() => {
    if (!propertyEnabled || personaListQuery.isLoading || personaGroupQuery.isLoading) return
    const venueId = personaGroupQuery.data?.propertyId
    if (!venueId) return

    const pool = new Map()

    personaListQuery.data?.data.forEach(persona => {
      if (persona.identityId) {
        const unitId = persona.identityId
        getUnitById({ params: { venueId, unitId } })
          .then(result => {
            if (result.data) {
              pool.set(unitId, result.data.name)
            }
          })
      }
    })

    setVenueId(venueId)
    setUnitPool(pool)
  }, [personaListQuery.data, personaGroupQuery.data])

  useEffect(() => {
    if (!personaGroupId) return
    if (personaGroupQuery.isLoading || personaListQuery.isLoading) return
    if (!personaGroupQuery.data || !personaListQuery.data) return

    const serviceId = personaGroupQuery.data?.dpskPoolId
    if (!serviceId) return

    personaListQuery.data.data.forEach(persona => {
      const passphraseId = persona.dpskGuid
      if (!passphraseId) return

      getDpskDevices({ params: { tenantId, passphraseId, serviceId } })
        .then(result => {
          if (result.data) {
            const count = result.data.filter(d => d.online).length
            setDpskDeviceCount(prev => new Map(prev.set(passphraseId, count)))
          }
        })
    })
  }, [personaListQuery.isLoading, personaGroupQuery.isLoading])

  const toastDetailErrorMessage = (error: PersonaErrorResponse) => {
    const hasSubMessages = error.data?.subErrors
    showToast({
      type: 'error',
      content: error.data?.message ?? $t({ defaultMessage: 'An error occurred' }),
      link: hasSubMessages && { onClick: () => {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Technical Details' }),
          content: $t({
            defaultMessage: 'The following information was reported for the error you encountered'
          }),
          customContent: {
            action: 'SHOW_ERRORS',
            // @ts-ignore
            errorDetails: error.data?.subErrors
          }
        })
      } }
    })
  }

  const importPersonas = async (formData: FormData, values: object) => {
    const { groupId } = values as { groupId: string }
    try {
      await uploadCsv({
        params: { groupId: personaGroupId ?? groupId },
        payload: formData
      }).unwrap()
      setUploadCsvDrawerVisible(false)
    } catch (error) {
      toastDetailErrorMessage(error as PersonaErrorResponse)
    }
  }

  const downloadPersona = () => {
    downloadCsv({
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
    }
  ]

  const rowActions: TableProps<Persona>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data], clearSelection) => {
        setDrawerState({ data, isEdit: true, visible: true })
        clearSelection()
      },
      visible: (selectedItems => selectedItems.length === 1)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      // We would not allow the user to delete the persons which was created by the Unit.
      disabled: (selectedItems => selectedItems.filter(p => !!p?.identityId).length > 0),
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
            // const names = selectedItems.map(({ name }) => name).join(', ')

            deletePersonas({ payload: ids })
              .unwrap()
              .then(() => {
                // const fewItems = ids.length <= 5
                // showToast({
                //   type: 'success',
                //   content: $t({
                //     // eslint-disable-next-line max-len
                //     defaultMessage: '{fewItems, select, ' +
                //       'true {Persona {names} was deleted} ' +
                //       'other {{count} personas was deleted}}'
                //   }, { fewItems, names, count: ids.length })
                // })
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

  setPersonasCount?.(personaListQuery.data?.totalCount || 0)
  return (
    <Loader
      states={[
        personaListQuery,
        { isLoading: false, isFetching: isDeletePersonasUpdating }
      ]}
    >
      <Table<Persona>
        enableApiFilter
        settingsId='base-persona-table'
        columns={columns}
        dataSource={personaListQuery.data?.data}
        pagination={personaListQuery.pagination}
        onChange={personaListQuery.handleTableChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: personaGroupId ? 'checkbox' : 'radio' }}
        onFilterChange={handleFilterChange}
        iconButton={{
          icon: <DownloadOutlined data-testid={'export-persona'} />,
          onClick: downloadPersona
        }}
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
        type={ImportFileDrawerType.Persona}
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
