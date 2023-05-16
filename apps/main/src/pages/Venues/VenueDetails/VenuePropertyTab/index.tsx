import { useEffect, useState } from 'react'


import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import {
  WarningTriangleSolid
} from '@acx-ui/icons'
import { CsvSize, ImportFileDrawer }      from '@acx-ui/rc/components'
import {
  useDeletePropertyUnitsMutation,
  useGetPropertyConfigsQuery,
  useGetPropertyUnitListQuery,
  useLazyApListQuery,
  useLazyGetPersonaByIdQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useLazyGetSwitchListQuery,
  useUpdatePropertyUnitMutation,
  useImportPropertyUnitsMutation,
  useLazyDownloadPropertyUnitsQuery,
  useLazyGetConnectionMeteringByIdQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  ConnectionMetering,
  FILTER,
  Persona,
  PropertyUnit,
  PropertyUnitStatus,
  SEARCH,
  SwitchViewModel,
  useTableQuery
} from '@acx-ui/rc/utils'
import {
  getPolicyDetailsLink, PolicyOperation, PolicyType
} from '@acx-ui/rc/utils'
import {
  TenantLink
} from '@acx-ui/react-router-dom'

import { PropertyUnitDrawer } from './PropertyUnitDrawer'



const WarningTriangle = styled(WarningTriangleSolid)
  .attrs((props: { expired: boolean }) => props)`
path:nth-child(1) {
  fill: ${props => props.expired ? 'var(--acx-accents-orange-60);':'var(--acx-accents-orange-30);'}
}
path:nth-child(3) {
  stroke: ${props => props.expired ?
    'var(--acx-accents-orange-60);':'var(--acx-accents-orange-30);'}
}
`

function ConnectionMeteringLink (props:{ id?: string, name?: string, expirationEpoch?: number }) {
  const { $t } = useIntl()
  const { id, name, expirationEpoch } = props
  let expired = false
  let tooltip = ''
  let showWarning = false
  if (expirationEpoch) {
    const now = new Date().getTime() / 1000
    if (expirationEpoch <= now) {
      expired = true
      showWarning = true
    } else if ((expirationEpoch - now) / (60 * 60 * 24) < 7) {
      showWarning = true
      expired = false
      const expireDate = moment(new Date(0).setUTCSeconds(expirationEpoch)).format('yyyy/MM/DD')
      tooltip = $t({ defaultMessage: 'The Consumption data is due to expire on' })
        .concat(' ' + expireDate)
    }
  }
  return (
    <div style={{ fontSize: '16px' }}>
      <div style={{ float: 'left', marginLeft: '5%' }}>
        <TenantLink to={getPolicyDetailsLink({ type: PolicyType.CONNECTION_METERING,
          oper: PolicyOperation.DETAIL, policyId: id ?? '' })}>
          {name ?? id}
        </TenantLink>
      </div>
      {showWarning &&
        <div style={{ float: 'left', marginLeft: '10%' }} title={tooltip}>
          <WarningTriangle expired={expired}/>
        </div>
      }
    </div>
  )
}


export function VenuePropertyTab () {
  const { $t } = useIntl()
  const { venueId, tenantId } = useParams()
  const enabled = (status: string) => status === PropertyUnitStatus.ENABLED
  const [personaMap, setPersonaMap] = useState(new Map<string, Persona>())
  const [apMap, setApMap] = useState(new Map())
  const [switchMap, setSwitchMap] = useState(new Map())
  const [connectionMeteringMap, setConnectionMeteringMap] = useState(new Map())
  const [withNsg, setWithNsg] = useState(false)
  const [drawerState, setDrawerState] = useState<{
    isEdit: boolean,
    visible: boolean,
    unitId?: string
  }>({
    isEdit: false,
    visible: false
  })
  const [uploadCsvDrawerVisible, setUploadCsvDrawerVisible] = useState(false)

  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const [deleteUnitByIds] = useDeletePropertyUnitsMutation()
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const [getConnectionMeteringById] = useLazyGetConnectionMeteringByIdQuery()
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [groupId, setGroupId] =
    useState<string|undefined>(propertyConfigsQuery?.data?.personaGroupId)
  const [getPersonaById] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById, personaGroupQuery] = useLazyGetPersonaGroupByIdQuery()
  const [downloadCsv] = useLazyDownloadPropertyUnitsQuery()
  const [uploadCsv, uploadCsvResult] = useImportPropertyUnitsMutation()

  const queryUnitList = useTableQuery({
    useQuery: useGetPropertyUnitListQuery,
    defaultPayload: {} as {
      filters: { name: string|undefined }
    }
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
      payload: queryUnitList.payload
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
      .then(result => setWithNsg(!!result.data?.nsgId))

    setGroupId(propertyConfigsQuery.data.personaGroupId)
  }, [propertyConfigsQuery.data])

  useEffect(() => {
    if (queryUnitList.isLoading || !queryUnitList.data || !groupId) return

    const personaIds = queryUnitList.data.data
      .filter(({ id, personaId }) => (id && personaId))
      .map(({ personaId }) => personaId)
    // const personaIds = [
    //   '1e0c5e78-6a1c-471a-9edd-e6d2acb4e758',
    //   '6f700763-03e3-4515-987a-93da9e053f0b',
    //   'b6616987-ddc4-4495-8b26-ee354f5adcd0']

    fetchPersonaData(personaIds)
  }, [queryUnitList.isLoading, groupId])

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
    fetchConnectionMeteringData([...connectionMeteringSet])
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

    getApList({ payload: { ...apViewModelPayload, filters: { apMac } } })
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

    getSwitchList({
      params: { tenantId },
      payload: { ...switchViewModelPayload, filters: { switchMac } }
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
            window.open(decodeURIComponent(residentPortalUrl), '_blank')
          }
        }
      })
  }

  const actions: TableProps<PropertyUnit>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Unit' }),
      onClick: () => setDrawerState({ isEdit: false, visible: true, unitId: undefined })
    },
    {
      label: $t({ defaultMessage: 'Import From File' }),
      onClick: () => setUploadCsvDrawerVisible(true)
    },
    {
      label: $t({ defaultMessage: 'Export To CSV' }),
      onClick: downloadUnit
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
            payload: {
              status: enabled(unit.status)
                ? PropertyUnitStatus.DISABLED
                : PropertyUnitStatus.ENABLED
            }
          })
            .then(clearSelection)
        })
      }
    },
    {
      label: $t({ defaultMessage: 'View Portal' }),
      visible: (selectedItems => selectedItems.length <= 1),
      onClick: ([{ id }], clearSelection) => {
        directToPortal(id)
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
      align: 'center',
      render: (_, row) => personaMap.get(row.personaId)?.vlan
    },
    {
      show: withNsg,
      key: 'accessPoint',
      title: $t({ defaultMessage: 'Access Point' }),
      dataIndex: 'accessPoint',
      render: (_, row) => {
        const persona = personaMap.get(row.personaId)
        const apMac = persona?.ethernetPorts?.[0]?.macAddress ?? ''
        return (apMap.get(apMac) as APExtended)?.name
        ?? persona?.ethernetPorts?.[0]?.name
      }
    },
    {
      show: withNsg,
      key: 'switchPorts',
      title: $t({ defaultMessage: 'Switch Ports' }),
      dataIndex: 'switchPorts',
      render: (_, row) => {
        const persona = personaMap.get(row.personaId)
        const switchMac = persona?.switches?.[0]?.macAddress ?? ''
        return (switchMap.get(switchMac) as SwitchViewModel)?.name
      }
    },
    {
      key: 'Connection Metering',
      title: $t({ defaultMessage: 'Connection Metering' }),
      dataIndex: ['connectionMetering'],
      render: (_, row) => {
        const persona = personaMap.get(row.personaId)
        const connectionMeteringId = persona?.meteringProfileId ?? ''
        // eslint-disable-next-line max-len
        const connectionMetering = connectionMeteringMap.get(connectionMeteringId) as ConnectionMetering
        if (connectionMetering) {
          // eslint-disable-next-line max-len
          return <ConnectionMeteringLink id={connectionMetering.id} name={connectionMetering.name} expirationEpoch={persona?.expirationEpoch}/>
        }
        //return <ConnectionMeteringLink name='test' expirationEpoch={100000000}/>
        return ''
      }
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

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = queryUnitList.payload
    const currentSearchString = payload.filters?.name ?? ''

    if (currentSearchString === customSearch.searchString) return

    queryUnitList.setPayload({
      ...payload,
      filters: { name: customSearch.searchString !== '' ? customSearch.searchString : undefined }
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
        columns={columns}
        enableApiFilter
        onFilterChange={handleFilterChange}
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
      <ImportFileDrawer
        title={$t({ defaultMessage: 'Import Units From File' })}
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        type='PropertyUnit'
        acceptType={['xlsx']}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        templateLink='assets/templates/units_import_template.xlsx'
        importRequest={importUnits}
        formDataName={'unitImports'}
        onClose={() => setUploadCsvDrawerVisible(false)}
      />
    </Loader>
  )
}
