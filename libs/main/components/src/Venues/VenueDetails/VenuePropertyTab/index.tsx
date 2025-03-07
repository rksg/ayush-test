import { ReactNode, useEffect, useState } from 'react'


import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { DateFormatEnum, userDateTimeFormat }                    from '@acx-ui/formatter'
import { DownloadOutlined, WarningTriangleSolid }                from '@acx-ui/icons'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType }       from '@acx-ui/rc/components'
import {
  useDeletePropertyUnitsMutation,
  useGetPropertyConfigsQuery,
  useGetPropertyUnitListQuery,
  useGetVenueQuery,
  useImportPropertyUnitsMutation,
  useLazyApListQuery,
  useLazyDownloadPropertyUnitsQuery,
  useLazyGetConnectionMeteringByIdQuery,
  useLazyGetPersonaByIdQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useLazyGetSwitchListQuery,
  useNotifyPropertyUnitsMutation,
  useUpdatePropertyUnitMutation
} from '@acx-ui/rc/services'
import {
  APExtended,
  ConnectionMetering,
  FILTER,
  getPolicyDetailsLink,
  Persona,
  PolicyOperation,
  PolicyType,
  PropertyUnit,
  PropertyUnitMessages,
  PropertyUnitStatus,
  SEARCH,
  SwitchViewModel,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }               from '@acx-ui/react-router-dom'
import { RolesEnum }                from '@acx-ui/types'
import { filterByAccess, hasRoles } from '@acx-ui/user'
import { exportMessageMapping }     from '@acx-ui/utils'

import { PropertyUnitBulkDrawer }     from './PropertyUnitBulkDrawer'
import { PropertyUnitDrawer }         from './PropertyUnitDrawer'
import { PropertyUnitIdentityDrawer } from './PropertyUnitIdentityDrawer/PropertyUnitIdentityDrawer'

const WarningTriangle = styled(WarningTriangleSolid)
  .attrs((props: { $expired: boolean }) => props)`
path:nth-child(1) {
  fill: ${props => props.$expired ? 'var(--acx-semantics-red-50);':'var(--acx-accents-orange-30);'}
}
path:nth-child(3) {
  stroke: ${props => props.$expired ?
    'var(--acx-semantics-red-50);':'var(--acx-accents-orange-30);'}
}
`

function ConnectionMeteringLink (props:{
  id: string,
  name: string,
  expirationDate?: string | null }
) {
  const { $t } = useIntl()
  const { id, name, expirationDate } = props
  let expired = false
  let tooltip = ''
  let showWarning = false
  if (expirationDate) {
    const now = moment.now()
    const expirationTime = moment(expirationDate)
    if (expirationTime.diff(now) < 0) {
      expired = true
      showWarning = true
      tooltip = $t({ defaultMessage: 'The Data Consumption date has expired' })
    } else if (expirationTime.diff(now, 'days') < 7) {
      showWarning = true
      expired = false
      tooltip = $t({ defaultMessage: 'The Consumption data is due to expire on {expireDate}' }
        , { expireDate: expirationTime.format(userDateTimeFormat(DateFormatEnum.DateFormat)) })
    }
  }
  return (
    <div>
      <div style={{ float: 'left', marginLeft: '5%' }}>
        <TenantLink to={
          getPolicyDetailsLink({
            type: PolicyType.CONNECTION_METERING,
            oper: PolicyOperation.DETAIL, policyId: id })
        }>
          {name ?? id}
        </TenantLink>
      </div>
      {showWarning &&
        <div style={{ float: 'left' }} title={tooltip}>
          <WarningTriangle $expired={expired} style={{ height: '16px' }}/>
        </div>
      }
    </div>
  )
}


export function VenuePropertyTab () {
  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const PropertyUnitStatusOptions = [
    { key: PropertyUnitStatus.ENABLED, value: $t({ defaultMessage: 'Active' }) },
    { key: PropertyUnitStatus.DISABLED, value: $t({ defaultMessage: 'Suspended' }) }
  ]
  const { venueId, tenantId } = useParams()
  const enabled = (status: string) => status === PropertyUnitStatus.ENABLED
  const [personaMap, setPersonaMap] = useState(new Map<string, Persona>())
  const [apMap, setApMap] = useState(new Map())
  const [switchMap, setSwitchMap] = useState(new Map())
  const [connectionMeteringMap, setConnectionMeteringMap] = useState(new Map())
  const [withPin, setWithPin] = useState(true)
  const [drawerState, setDrawerState] = useState<{
    isEdit: boolean,
    visible: boolean,
    units?: PropertyUnit[]
  }>({
    isEdit: false,
    visible: false
  })
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit>()
  const [uploadCsvDrawerVisible, setUploadCsvDrawerVisible] = useState(false)
  const [addIdentityDrawerVisible, setAddIdentityDrawerVisible] = useState(false)

  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const [deleteUnitByIds] = useDeletePropertyUnitsMutation()
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const [notifyUnits] = useNotifyPropertyUnitsMutation()

  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [groupId, setGroupId] =
    useState<string|undefined>(propertyConfigsQuery?.data?.personaGroupId)
  const hasAssociation = !!groupId
  const [getPersonaById] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById, personaGroupQuery] = useLazyGetPersonaGroupByIdQuery()
  const [downloadCsv] = useLazyDownloadPropertyUnitsQuery()
  const [uploadCsv, uploadCsvResult] = useImportPropertyUnitsMutation()
  const isConnectionMeteringAvailable = useIsSplitOn(Features.CONNECTION_METERING)
  const isMultipleIdentityUnits = useIsSplitOn(Features.MULTIPLE_IDENTITY_UNITS)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [getConnectionMeteringById] = useLazyGetConnectionMeteringByIdQuery()
  const hasResidentPortalAssignment = !!propertyConfigsQuery?.data?.residentPortalId
  const hasPropertyUnitPermission = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const settingsId = 'property-units-table'
  const queryUnitList = useTableQuery({
    useQuery: useGetPropertyUnitListQuery,
    defaultPayload: {} as {
      filters: { name: string|undefined }
    },
    pagination: { settingsId }
  })

  const importUnits = async (formData: FormData) => {
    try {
      await uploadCsv({
        params: { venueId },
        payload: formData
      }).unwrap()
      setUploadCsvDrawerVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const downloadUnit = () => {
    downloadCsv({
      params: { venueId },
      payload: {
        ...queryUnitList.payload,
        pageSize: 2147483647,
        page: 1
      }
    }).unwrap().catch((error) => {
      console.log(error) // eslint-disable-line no-console
    })
  }

  const apViewModelPayload = {
    fields: ['name', 'venueName', 'serialNumber', 'apMac', 'IP', 'model', 'venueId'],
    filters: { apMac: apMap.keys() }
  }
  const switchViewModelPayload = {
    fields: ['name', 'switchMac', 'serialNumber'],
    filters: { switchMac: switchMap.keys() }
  }

  const [ getApList ] = useLazyApListQuery()
  const [ getSwitchList ] = useLazyGetSwitchListQuery()

  useEffect(() => {
    if (propertyConfigsQuery.isLoading) return
    if (!propertyConfigsQuery.data?.personaGroupId) return

    getPersonaGroupById({ params: { groupId: propertyConfigsQuery.data.personaGroupId } })
      .then(result => setWithPin(!!result.data?.personalIdentityNetworkId))

    setGroupId(propertyConfigsQuery.data.personaGroupId)
  }, [propertyConfigsQuery.data])

  useEffect(() => {
    if (queryUnitList.isLoading || queryUnitList.isFetching
      || !queryUnitList.data || !groupId) return

    const personaIds = queryUnitList.data.data
      .filter(({ id, personaId }) => (id && personaId))
      .map(({ personaId }) => personaId)

    fetchPersonaData(personaIds)
  }, [queryUnitList.isLoading, queryUnitList.isFetching, groupId])

  useEffect(() => {
    const apMacs: string[] = []
    const switchMacs: string[] = []
    const connectionMeteringSet: Set<string> = new Set()
    personaMap.forEach(p => {
      if (p?.ethernetPorts && p.ethernetPorts.length > 0) {
        apMacs.push(p.ethernetPorts[0].macAddress)
      }

      if (p?.switches && p?.switches.length > 0) {
        switchMacs.push(p.switches[0].macAddress)
      }

      if (p?.meteringProfileId) {
        connectionMeteringSet.add(p.meteringProfileId)
      }
    })

    fetchApData(apMacs)
    fetchSwitchData(switchMacs)
    if (isConnectionMeteringAvailable) {
      fetchConnectionMeteringData([...connectionMeteringSet])
    }
  }, [personaMap])

  const fetchPersonaData = (ids: string[]) => {
    ids.forEach(id => {
      getPersonaById({ params: { groupId, id } })
        .then(result => {
          if (result.data) {
            setPersonaMap(map => new Map( map.set(id, result.data as Persona)))
          }
        })
    })
  }

  const fetchConnectionMeteringData = (ids: string[]) => {
    ids.forEach(id => {
      getConnectionMeteringById({ params: { id } })
        .then(result=>{
          if (result.data) {
            setConnectionMeteringMap(map => new Map(map.set(id, result.data as ConnectionMetering)))
          }
        })
    })
  }

  const fetchApData = (apMac: string[]) => {
    // console.log('Fetch aps : ', apMac)

    setApMap(new Map())
    getApList({
      payload: { ...apViewModelPayload, filters: { apMac } },
      enableRbac: isWifiRbacEnabled
    })
      .then(result => {
        if (result.data) {
          result.data.data.forEach(ap => {
            if (ap.apMac === undefined) return
            const formattedMac = ap.apMac.replaceAll('-', ':')
            setApMap(map => new Map(map.set(formattedMac, ap)))
          })
        }
      })
  }

  const fetchSwitchData = (switchMac: string[]) => {
    // console.log('Fetch switches : ', switchMac)

    if (!switchMac || switchMac.length === 0) return

    setSwitchMap(new Map())
    getSwitchList({
      params: { tenantId },
      payload: { ...switchViewModelPayload, filters: { switchMac } },
      enableRbac: isSwitchRbacEnabled
    })
      .then(result => {
        if (result.data) {
          result.data.data.forEach(switchDevice => {
            setSwitchMap(map => new Map(map.set(switchDevice.switchMac, switchDevice)))
          })
        }
      })
  }

  const directToPortal = (unitId: string) => {
    getUnitById({ params: { venueId, unitId } })
      .then((result) => {
        if (result.data) {
          const residentPortalUrl = (result.data as PropertyUnit)?._links?.residentPortal?.href
          if (residentPortalUrl) {
            window.open(residentPortalUrl, '_blank')
          }
        }
      })
  }

  const actions: TableProps<PropertyUnit>['actions'] =
    hasPropertyUnitPermission
      ? [{
        label: $t({ defaultMessage: 'Add Unit' }),
        disabled: !hasAssociation,
        onClick: () => setDrawerState({ isEdit: false, visible: true, units: undefined })
      },
      {
        label: $t({ defaultMessage: 'Import From File' }),
        disabled: !hasAssociation,
        onClick: () => setUploadCsvDrawerVisible(true)
      }] : []

  const rowActions: TableProps<PropertyUnit>['rowActions'] =
    hasPropertyUnitPermission
      ? [
        {
          label: $t({ defaultMessage: 'Edit' }),
          visible: (selectedItems => selectedItems.length <= 1 ||
        (isConnectionMeteringAvailable && selectedItems.length > 1)),
          onClick: (units, clearSelection) => {
            setDrawerState({ units: units.map(u=> {return {
              ...u,
              trafficControl: personaMap.get(u.personaId)?.meteringProfileId ?
                {
                  meteringProfileId: personaMap.get(u.personaId)?.meteringProfileId!!,
                  profileExpiry: personaMap.get(u.personaId)?.expirationDate!!
                } : undefined }}), isEdit: true, visible: true })
            clearSelection()
          }
        },
        {
          label: $t({ defaultMessage: 'Suspend' }),
          visible: (selectedRows => {
            const activeCount = selectedRows.filter(row => enabled(row.status)).length
            return activeCount > 0 && activeCount === selectedRows.length
          }),
          onClick: (items, clearSelection) => {
            showActionModal({
              type: 'confirm',
              title: $t({
                defaultMessage: `Suspend "{count, plural,
            one {{entityValue}}
            other {{count} {entityName}}
            }"?` }, {
                count: items.length,
                entityValue: items[0].name,
                entityName: $t({ defaultMessage: 'Units' })
              }),
              content: $t({ defaultMessage: `Are you sure you want to suspend {count, plural,
              one {this Unit}
              other {these Units}
              }?` }, { count: items.length }),
              okText: $t({ defaultMessage: 'Suspend' }),
              onOk () {
                items.forEach(unit => {
                  updateUnitById({
                    params: { venueId, unitId: unit.id },
                    payload: { status: PropertyUnitStatus.DISABLED }
                  })
                    .then(clearSelection)
                })
              }
            })
          }
        },
        {
          label: $t({ defaultMessage: 'Activate' }),
          visible: (selectedRows => {
            const suspendCount = selectedRows.filter(row => !enabled(row.status)).length
            return suspendCount > 0 && suspendCount === selectedRows.length
          }),
          onClick: (items, clearSelection) => {
            items.forEach(unit => {
              updateUnitById({
                params: { venueId, unitId: unit.id },
                payload: { status: PropertyUnitStatus.ENABLED }
              })
                .then(clearSelection)
            })
          }
        },
        {
          label: $t({ defaultMessage: 'View Portal' }),
          visible: (selectedItems => (selectedItems.length <= 1 && hasResidentPortalAssignment)),
          onClick: ([{ id }], clearSelection) => {
            directToPortal(id)
            clearSelection()
          }
        },
        {
          label: $t({ defaultMessage: 'Add Identity Association' }),
          visible: (selectedItems => selectedItems.length <= 1 && isMultipleIdentityUnits),
          onClick: (units, clearSelection) => {
            setSelectedUnit(units.at(0))
            clearSelection()
            setAddIdentityDrawerVisible(true)
          }
        },
        {
          label: $t({ defaultMessage: 'Resend' }),
          onClick: (selectedItems, clearSelection) => {
            notifyUnits({ params: { venueId }, payload: selectedItems.map(i => i.id) })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t(PropertyUnitMessages.RESEND_NOTIFICATION)
                })
              })
              .catch(() => {})
              .finally(clearSelection)
          }
        },
        {
          label: $t({ defaultMessage: 'Delete' }),
          onClick: (selectedItems, clearSelection) => {
            setDrawerState({ isEdit: false, visible: false })
            showActionModal({
              type: 'confirm',
              customContent: {
                action: 'DELETE',
                entityName: $t({ defaultMessage: 'Unit' }),
                entityValue: selectedItems[0].name,
                numOfEntities: selectedItems.length
              },
              onOk: () => {
                deleteUnitByIds({ params: { venueId }, payload: selectedItems.map(i => i.id) })
                  .then(() => clearSelection())
              }
            })
          }
        }
      ] : []

  const columns: TableProps<PropertyUnit>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Unit Name' }),
      dataIndex: 'name',
      searchable: true,
      render: function (_, row, __, highlightFn) {
        return (
          isMultipleIdentityUnits ? <TenantLink
            to={`/venues/${venueId}/${row.id}/property-units`}>
            {highlightFn(row.name)}</TenantLink> : row.name
        )
      }
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      filterMultiple: false,
      filterable: PropertyUnitStatusOptions,
      render: (_, row) => row.status === PropertyUnitStatus.ENABLED
        ? $t({ defaultMessage: 'Active' }) : $t({ defaultMessage: 'Suspended' })
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      align: 'center',
      render: (_, row) => personaMap.get(row.personaId)?.vlan
    },
    ...withPin ? [
      {
        key: 'accessPoint',
        title: $t({ defaultMessage: 'Access Point' }),
        dataIndex: 'accessPoint',
        render: (_: ReactNode, row: PropertyUnit) => {
          const persona = personaMap.get(row.personaId)
          const apMac = persona?.ethernetPorts?.[0]?.macAddress ?? ''
          const apName = (apMap.get(apMac) as APExtended)?.name
            ?? persona?.ethernetPorts?.[0]?.name
          return apName
            ? `${apName} ${persona?.ethernetPorts?.map(port => `LAN ${port.portIndex}`).join(', ')}`
            : undefined
        }
      },
      {
        key: 'switchPorts',
        title: $t({ defaultMessage: 'Switch Ports' }),
        dataIndex: 'switchPorts',
        render: (_: ReactNode, row: PropertyUnit) => {
          const switchList: string[] = []

          personaMap.get(row.personaId)?.switches?.forEach(s => {
            const switchMac = s.macAddress
            const switchName = (switchMap.get(switchMac) as SwitchViewModel)?.name

            if (switchName) {
              switchList.push(`${switchName} ${s.portId}`)
            }
          })

          return switchList.map((s, index) => <div key={index}>{s}</div>)
        }
      }] : [],
    ...isConnectionMeteringAvailable ? [
      {
        key: 'connectionMetering',
        title: $t({ defaultMessage: 'Data Usage Metering' }),
        dataIndex: 'connectionMetering',
        render: (_: ReactNode, row: PropertyUnit) => {
          const persona = personaMap.get(row.personaId)
          const connectionMeteringId = persona?.meteringProfileId ?? ''
          // eslint-disable-next-line max-len
          const connectionMetering = connectionMeteringMap.get(connectionMeteringId) as ConnectionMetering
          if (persona && connectionMetering) {
          // eslint-disable-next-line max-len
            return <ConnectionMeteringLink id={connectionMetering.id} name={connectionMetering.name} expirationDate={persona.expirationDate}/>
          }
          return ''
        }
      }]: [],
    ...isMultipleIdentityUnits ? [{
      key: 'identityCount',
      title: $t({ defaultMessage: 'Identities' }),
      dataIndex: ['identityCount']
    }] : [],
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

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = queryUnitList.payload

    const customPayload = {
      filters: {
        name: customSearch.searchString !== '' ? customSearch.searchString : undefined,
        status: Array.isArray(customFilters?.status) ? customFilters?.status[0] : undefined
      }
    }

    queryUnitList.setPayload({
      ...payload,
      ...customPayload
    })
  }

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
        settingsId={settingsId}
        columns={columns}
        enableApiFilter
        onFilterChange={handleFilterChange}
        dataSource={queryUnitList.data?.data}
        pagination={queryUnitList.pagination}
        onChange={queryUnitList.handleTableChange}
        actions={filterByAccess(hasAssociation ? actions : [])}
        rowActions={filterByAccess(rowActions)}
        rowSelection={
          hasPropertyUnitPermission && { type: 'checkbox' }}
        iconButton={{
          icon: <DownloadOutlined data-testid={'export-unit'} />,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: downloadUnit
        }}
      />
      {venueId && drawerState.visible && (!drawerState.units || drawerState.units.length === 1 ) &&
        <PropertyUnitDrawer
          visible={true}
          venueId={venueId}
          countryCode={venueData?.address?.countryCode}
          unitId={drawerState?.units?.at(0)?.id}
          isEdit={drawerState.isEdit}
          onClose={() => setDrawerState({ isEdit: false, visible: false, units: undefined })}
        />
      }
      {venueId && drawerState.visible && (drawerState.units && drawerState.units.length > 1 ) &&
        <PropertyUnitBulkDrawer
          visible={true}
          venueId={venueId}
          data={drawerState.units}
          onClose={() => setDrawerState({ isEdit: false, visible: false, units: undefined })}
        />
      }
      {groupId && addIdentityDrawerVisible && <PropertyUnitIdentityDrawer
        visible={addIdentityDrawerVisible}
        groupId={groupId}
        venueId={venueId}
        unitId={selectedUnit?.id}
        identityCount={selectedUnit?.identityCount}
        onClose={() => {
          setAddIdentityDrawerVisible(false)
        }}
      />
      }
      <ImportFileDrawer
        title={$t({ defaultMessage: 'Import Units From File' })}
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        type={ImportFileDrawerType.PropertyUnit}
        acceptType={['csv']}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        templateLink='assets/templates/units_import_template.csv'
        importRequest={importUnits}
        formDataName={'unitImports'}
        onClose={() => setUploadCsvDrawerVisible(false)}
      />
    </Loader>
  )
}
