import { createContext, useContext, useEffect, useState } from 'react'

import { Form }        from 'antd'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { useIdentityListQuery }                                               from '@acx-ui/cloudpath/components'
import { Loader, showActionModal, showToast, Table, TableColumn, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                           from '@acx-ui/feature-toggle'
import { DownloadOutlined }                                                   from '@acx-ui/icons'
import {
  useDeletePersonasMutation,
  useGetPersonaGroupByIdQuery,
  useImportPersonasMutation,
  useLazyDownloadPersonasQuery,
  useLazyBatchGetPropertyUnitsByIdsQuery,
  useSearchPersonaGroupListQuery,
  useGetUnitsLinkedIdentitiesQuery,
  useGetPropertyUnitListQuery
} from '@acx-ui/rc/services'
import { FILTER, Persona, PersonaErrorResponse, PersonaGroup, PersonaUrls, SEARCH } from '@acx-ui/rc/utils'
import { useTenantLink }                                                            from '@acx-ui/react-router-dom'
import { filterByAccess, hasCrossVenuesPermission }                                 from '@acx-ui/user'
import { exportMessageMapping, getOpsApi, useTrackLoadTime, widgetsMapping }        from '@acx-ui/utils'

import { IdentityDetailsLink, IdentityGroupLink, PropertyUnitLink } from '../../CommonLinkHelper'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType }          from '../../ImportFileDrawer'
import { useIsEdgeFeatureReady }                                    from '../../useEdgeActions'
import { PersonaDrawer }                                            from '../PersonaDrawer'
import { PersonaGroupSelect }                                       from '../PersonaGroupSelect'
import { PersonaBlockedIcon }                                       from '../styledComponents'

const IdentitiesContext = createContext({} as {
  setIdentitiesCount: (data: number) => void
})

function useColumns (
  groupData: PersonaGroup | undefined,
  props: PersonaTableColProps,
  unitPool: Map<string, string>,
  venueId: string,
  useByIdentityGroup: boolean
) {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isMultipleIdentityUnits = useIsSplitOn(Features.MULTIPLE_IDENTITY_UNITS)

  const personaGroupList = useSearchPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  })

  const identities = new Map(useGetUnitsLinkedIdentitiesQuery
  ({
    params: { venueId: venueId },
    payload: { pageSize: 10000, page: 1, sortOrder: 'ASC' }
  },
  { skip: !venueId || !isMultipleIdentityUnits }
  ).data?.data?.map(identity => [identity.personaId, identity.unitId]))

  const units = new Map(useGetPropertyUnitListQuery({
    params: { venueId: venueId },
    payload: {
      page: 1,
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  },
  { skip: !venueId || !isMultipleIdentityUnits }).data?.data?.map(unit => [unit.id,unit.name]))

  const shrinkedColumns: TableProps<Persona>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'Identity Name' }),
      render: (_, row) =>
        <IdentityDetailsLink
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
      title: $t({ defaultMessage: 'Status' }),
      align: 'center',
      sorter: true,
      render: (_, row) => {
        return (row.revoked) ? $t({ defaultMessage: 'Inactive' }) : $t({ defaultMessage: 'Active' })
      },
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
      key: 'deviceCount',
      dataIndex: 'deviceCount',
      title: $t({ defaultMessage: 'Devices' }),
      align: 'center',
      ...props.deviceCount
    },
    {
      key: 'identityId',
      dataIndex: 'identityId',
      title: $t({ defaultMessage: 'Unit' }),
      sorter: true,
      render: (_, row) =>
        <PropertyUnitLink
          venueId={venueId}
          unitId={row.identityId ? row.identityId : identities.get(row.id)}
          name={row.identityId
            ? unitPool.get(row.identityId)
            : units.get(identities.get(row.id) ?? '')}
        />
      ,
      ...props.identityId
    }
  ]


  const columns: TableProps<Persona>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'Identity Name' }),
      render: (_, row) =>
        <IdentityDetailsLink
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
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: $t({ defaultMessage: 'Phone' }),
      sorter: true,
      ...props.phoneNumber
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
        ...props.deviceCount
      } as TableColumn<Persona>],
    ...(props.certificateCount?.disable)
      ? []
      : (isCertTemplateEnabled && groupData?.certificateTemplateId)
        ? [{
          key: 'certificateCount',
          dataIndex: 'certificateCount',
          title: $t({ defaultMessage: 'Certificates' }),
          align: 'center',
          render: (_, row) => row.certificateCount ?? 0,
          ...props.certificateCount
        } as TableColumn<Persona>] : [],
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
            unitId={row.identityId ? row.identityId : identities.get(row.id)}
            name={row.identityId
              ? unitPool.get(row.identityId)
              : units.get(identities.get(row.id) ?? '')}
          />
        ,
        ...props.identityId
      } as TableColumn<Persona>],
    ...(props.groupId?.disable)
      ? []
      : [{
        key: 'groupId',
        dataIndex: 'group',
        title: $t({ defaultMessage: 'Identity Group' }),
        sorter: true,
        render: (_, row) => {
          const name = personaGroupList.data?.data.find(group => group.id === row.groupId)?.name
          return <IdentityGroupLink personaGroupId={row.groupId} name={name} />
        },
        filterMultiple: false,
        filterable: personaGroupList?.data?.data.map(pg => ({ key: pg.id, value: pg.name })) ?? [],
        ...props.groupId
      } as TableColumn<Persona>],
    ...(props.vlan?.disable)
      ? []
      : [{
        key: 'vlan',
        dataIndex: 'vlan',
        title: $t({ defaultMessage: 'VLAN' }),
        sorter: true,
        ...props.vlan
      }],
    ...(props.ethernetPorts?.disable)
      ? []
      : [{
        key: 'assignedAp',
        dataIndex: 'assignedAp',
        title: $t({ defaultMessage: 'Assigned AP' }),
        render: (_, row) => {
          // TODO: fetch AP info by MacAddress?
          return row?.ethernetPorts?.[0]?.name
        },
        ...props.ethernetPorts
      } as TableColumn<Persona>,
      {
        key: 'ethernetPorts',
        dataIndex: 'ethernetPorts',
        title: $t({ defaultMessage: 'Assigned Port' }),
        render: (_, row) => {
          return row.ethernetPorts?.map(port => `LAN ${port.portIndex}`).join(', ')
        },
        ...props.ethernetPorts
      } as TableColumn<Persona>],
    ...((!props.vni?.disable && networkSegmentationEnabled) ? [{
      key: 'vni',
      dataIndex: 'vni',
      title: $t({ defaultMessage: 'Segment No.' }),
      sorter: true,
      ...props.vni
    }] : [])
  ]

  return useByIdentityGroup ? shrinkedColumns : columns
}

interface PersonaTableCol extends
  Pick<TableColumn<Persona>, 'filterable' | 'searchable' | 'show' | 'disable'> {}

type PersonaTableColProps = {
  [key in keyof Persona]?: PersonaTableCol
}
export interface PersonaTableProps {
  mode?: 'display' | 'selectable',
  defaultSelectedPersonaId?: string,
  onChange?: (persona?: Persona) => void
  personaGroupId?: string,
  colProps: PersonaTableColProps,
  settingsId?: string,
  disableAddDevices?: boolean,
  useByIdentityGroup?: boolean
}

export function BasePersonaTable (props: PersonaTableProps) {
  const { $t } = useIntl()
  const {
    mode, personaGroupId,
    colProps, settingsId = 'base-persona-table', onChange,
    disableAddDevices, useByIdentityGroup = false
  } = props
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const isIdentityRefactor = useIsSplitOn(Features.IDENTITY_UI_REFACTOR)

  const basePath = useTenantLink('/users/identity-management/identity-group')
  const navigate = useNavigate()

  const [venueId, setVenueId] = useState('')
  const [unitPool, setUnitPool] = useState(new Map())
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
  const [getUnitsByIds] = useLazyBatchGetPropertyUnitsByIdsQuery()
  const { setIdentitiesCount } = useContext(IdentitiesContext)
  // eslint-disable-next-line max-len
  const columns = useColumns(personaGroupQuery?.data, colProps, unitPool, venueId, useByIdentityGroup)
  const isSelectMode = mode === 'selectable'

  const personaListQuery = useIdentityListQuery({ personaGroupId, settingsId })

  useEffect(() => {
    if (!propertyEnabled || personaGroupQuery.isLoading) return
    const venueId = personaGroupQuery.data?.propertyId
    if (!venueId) return

    setVenueId(venueId)
  }, [personaGroupQuery.data])

  useEffect(() => {
    if (!venueId || !personaListQuery.data?.data) return
    const unitIds: string[] = []

    personaListQuery.data?.data.forEach(persona => {
      const unitId = persona.identityId
      if (unitId && !unitPool.has(unitId)) {
        unitIds.push(unitId)
      }
    })
    getUnitsByIds({ payload: { venueId, ids: unitIds } })
      .then(units => {
        if (units.data) {
          units.data.forEach(unit => {
            unitPool.set(unit.id, unit.name)
          })
          setUnitPool(unitPool)
        }
      })
  }, [venueId, personaListQuery.data?.data])

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

  const actions: TableProps<PersonaGroup>['actions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [{
        label: $t({ defaultMessage: 'Add Identity' }),
        rbacOpsIds: [getOpsApi(PersonaUrls.addPersona)],
        onClick: () => {
          if (isIdentityRefactor && !useByIdentityGroup) {
            let pathname = basePath.pathname
            if (personaGroupId) {
              pathname = pathname.concat(`/${personaGroupId}`)
            }
            navigate({ ...basePath, pathname: `${pathname}/identity/create` })
          } else {
            // if user is under PersonaGroup page, props groupId into Drawer
            setDrawerState({ isEdit: false, visible: true, data: { groupId: personaGroupId } })
          }
        }
      },
      ...isSelectMode
        ? []
        : [{
          label: $t({ defaultMessage: 'Import From File' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.importPersonas)],
          onClick: () => setUploadCsvDrawerVisible(true)
        }]] : []

  const rowActions: TableProps<Persona>['rowActions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [
        {
          label: $t({ defaultMessage: 'Edit' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.updatePersona)],
          onClick: ([data], clearSelection) => {
            if (isIdentityRefactor) {
              let pathname = basePath.pathname
              if (data.groupId) {
                pathname = pathname.concat(`/${data.groupId}`)
                navigate({ ...basePath, pathname: `${pathname}/identity/${data.id}/edit` })
              }
            } else {
              setDrawerState({ data, isEdit: true, visible: true })
            }
            clearSelection()
          },
          visible: (selectedItems => selectedItems.length === 1)
        },
        {
          label: $t({ defaultMessage: 'Delete' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.deletePersonas)],
          // We would not allow the user to delete the persons which was created by the Unit.
          disabled: (selectedItems => selectedItems.filter(p => !!p?.identityId).length > 0),
          onClick: (selectedItems, clearSelection) => {
            showActionModal({
              type: 'confirm',
              customContent: {
                action: 'DELETE',
                entityName: $t({ defaultMessage: 'Identity' }),
                entityValue: selectedItems[0].name,
                numOfEntities: selectedItems.length
              },
              content:
            $t({
              // Display warning while one of the Persona contains devices.
              defaultMessage: `{hasDevices, select,
              true {The Identity contains devices in the MAC registration list.}
              other {}
              }
              Are you sure you want to delete {count, plural,
              one {this}
              other {these}
              } Identity?`
            }, {
              hasDevices: !!selectedItems.find(p => (p?.deviceCount ?? 0) > 0),
              count: selectedItems.length
            }),
              onOk: () => {
                const ids = selectedItems.map(({ id }) => id)

                if (ids.length === 0) return

                deletePersonas({
                  params: { groupId: personaGroupId ?? selectedItems[0].groupId },
                  payload: ids
                }).unwrap()
                  .then(() => {
                    clearSelection()
                  })
                  .catch((e) => {
                    console.log(e) // eslint-disable-line no-console
                  })
              }
            })
          }
        }
      ] : []

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

  setIdentitiesCount?.(personaListQuery.data?.totalCount || 0)

  useTrackLoadTime({
    itemName: widgetsMapping.IDENTITY_TABLE,
    states: [personaListQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader
      states={[
        personaListQuery,
        { isLoading: false, isFetching: isDeletePersonasUpdating }
      ]}
    >
      <Table<Persona>
        enableApiFilter
        settingsId={settingsId}
        columns={columns}
        dataSource={personaListQuery.data?.data}
        pagination={personaListQuery.pagination}
        onChange={personaListQuery.handleTableChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={isSelectMode ? [] : filterByAccess(rowActions)}
        rowSelection={
          isSelectMode
            ? {
              type: 'radio',
              onChange: (items) => onChange?.(personaListQuery.data?.data
                ?.find(p => p.id === items[0]))
            }
            : filterByAccess(rowActions).length !== 0
            && { type: personaGroupId ? 'checkbox' : 'radio' }}
        onFilterChange={handleFilterChange}
        iconButton={isSelectMode ? undefined : {
          icon: <DownloadOutlined data-testid={'export-persona'}/>,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: downloadPersona
        }}
      />

      {drawerState.visible && <PersonaDrawer
        visible
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
        disableAddDevices={disableAddDevices}
      />}
      {uploadCsvDrawerVisible && <ImportFileDrawer
        title={$t({ defaultMessage: 'Import from file' })}
        visible={true}
        isLoading={uploadCsvResult.isLoading}
        type={ImportFileDrawerType.Identity}
        acceptType={['csv']}
        maxSize={CsvSize['5MB']}
        maxEntries={1000}
        templateLink='assets/templates/identity_import_template.csv'
        importRequest={importPersonas}
        onClose={() => setUploadCsvDrawerVisible(false)}
      >
        <Form.Item
          name='groupId'
          rules={[{ required: true }]}
          initialValue={personaGroupId}
          label={$t({ defaultMessage: 'Identity Group' })}
        >
          <PersonaGroupSelect disabled={!!personaGroupId}/>
        </Form.Item>
      </ImportFileDrawer>}
    </Loader>
  )
}
