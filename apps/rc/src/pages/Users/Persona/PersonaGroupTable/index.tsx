import { useContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { DownloadOutlined }                       from '@acx-ui/icons'
import {
  DpskPoolLink,
  IdentityGroupLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupDrawer,
  useIsEdgeFeatureReady,
  VenueLink,
  CertTemplateLink
} from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeletePersonaGroupMutation,
  useGetCertificateTemplatesQuery,
  useGetEnhancedDpskListQuery,
  useGetEdgePinViewDataListQuery,
  useGetQueriablePropertyConfigsQuery,
  useLazyDownloadPersonaGroupsQuery,
  useLazyGetCertificateTemplateQuery,
  useLazyGetDpskQuery,
  useLazyGetMacRegListQuery,
  useLazyGetEdgePinByIdQuery,
  useLazyVenuesListQuery,
  useSearchMacRegListsQuery,
  useSearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import { FILTER, PersonaGroup, PersonaUrls, SEARCH, useTableQuery }          from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                        from '@acx-ui/react-router-dom'
import { filterByAccess, hasCrossVenuesPermission }                          from '@acx-ui/user'
import { exportMessageMapping, getOpsApi, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { IdentityGroupContext } from '..'

const propertyConfigDefaultPayload = {
  sortField: 'venueName',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 100
}

const macRegSearchDefaultPayload = {
  dataOption: 'all',
  searchCriteriaList: [
    {
      filterKey: 'name',
      operation: 'cn',
      value: ''
    }
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

function useColumns (
  macRegistrationPools: Map<string, string>,
  dpskPools: Map<string, string>,
  venuesMap: Map<string, string>,
  pinMap: Map<string, string>,
  certTemplateMap: Map<string, string>
) {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

  const { data: dpskPool } = useGetEnhancedDpskListQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  })
  const { data: macList } = useSearchMacRegListsQuery({ payload: macRegSearchDefaultPayload })
  const { data: pinList } = useGetEdgePinViewDataListQuery(
    {
      payload: {
        page: 1,
        pageSize: 10000,
        fields: ['name', 'id'],
        sortField: 'name',
        sortOrder: 'ASC'
      }
    },
    { skip: !networkSegmentationEnabled }
  )
  const { venueOptions, isVenueOptionsLoading } = useGetQueriablePropertyConfigsQuery({
    payload: propertyConfigDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isVenueOptionsLoading: isLoading,
        venueOptions: data?.data.map(item => ({ value: item.venueName!, key: item.venueId! })) ?? []
      }
    }
  })
  const { certTemplateOptions, isCertTemplatesLoading } = useGetCertificateTemplatesQuery({
    payload: { page: 1, pageSize: 10000 }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCertTemplatesLoading: isLoading,
        certTemplateOptions: data?.data.map(t => ({ value: t.name, key: t.id! })) ?? []
      }
    },
    skip: !isCertTemplateEnabled
  })

  const columns: TableProps<PersonaGroup>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Identity Group' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) =>
        <IdentityGroupLink
          name={row.name}
          personaGroupId={row.id}
        />
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true,
      searchable: true
    },
    {
      key: 'propertyId',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'propertyId',
      sorter: true,
      filterMultiple: false,
      filterable: isVenueOptionsLoading ? [] : venueOptions,
      render: (_, row) =>
        <VenueLink
          name={venuesMap.get(row?.propertyId ?? '')}
          venueId={row?.propertyId}
        />
    },
    {
      key: 'dpskPoolId',
      title: $t({ defaultMessage: 'DPSK Service' }),
      dataIndex: 'dpskPoolId',
      sorter: true,
      filterMultiple: false,
      filterable: dpskPool?.data.map(pool => ({ key: pool.id!!, value: pool.name })) ?? [],
      render: (_, row) =>
        <DpskPoolLink
          name={dpskPools.get(row.dpskPoolId ?? '')}
          dpskPoolId={row.dpskPoolId}
        />
    },
    {
      key: 'macRegistrationPoolId',
      title: $t({ defaultMessage: 'Mac Registration List' }),
      dataIndex: 'macRegistrationPoolId',
      sorter: true,
      filterMultiple: false,
      filterable: macList?.data.map(mac => ({ key: mac.id!!, value: mac.name })) ?? [],
      render: (_, row) =>
        <MacRegistrationPoolLink
          name={macRegistrationPools.get(row.macRegistrationPoolId ?? '')}
          macRegistrationPoolId={row.macRegistrationPoolId}
        />
    },
    ...(isCertTemplateEnabled ? [{
      key: 'certificateTemplateId',
      title: $t({ defaultMessage: 'Certificate Template' }),
      dataIndex: 'certificateTemplateId',
      sorter: true,
      filterMultiple: false,
      filterable: isCertTemplatesLoading ? [] : certTemplateOptions,
      render: (_, row) =>
        <CertTemplateLink
          name={certTemplateMap.get(row.certificateTemplateId ?? '')}
          id={row.certificateTemplateId}
        />
    } as TableColumn<PersonaGroup>] : []),
    ...(networkSegmentationEnabled ? [{
      key: 'personalIdentityNetworkId',
      title: $t({ defaultMessage: 'Personal Identity Network' }),
      dataIndex: 'personalIdentityNetworkId',
      sorter: true,
      filterMultiple: false,
      filterable: pinList?.data.map(pin => ({ key: pin.id, value: pin.name })) ?? [],
      render: (_, row) =>
        <NetworkSegmentationLink
          id={row.personalIdentityNetworkId}
          name={pinMap.get(row.personalIdentityNetworkId ?? '')}
        />
    } as TableColumn<PersonaGroup>] : []),
    {
      key: 'identityCount',
      title: $t({ defaultMessage: 'Identities' }),
      dataIndex: 'identityCount',
      align: 'center'
    }
  ]

  return columns
}

const defaultVenueListPayload = {
  fields: [
    'id',
    'name'
  ],
  filters: { id: [] }
}

export function PersonaGroupTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const basePath = useTenantLink('users/identity-management/identity-group')
  const navigate = useNavigate()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const [venueMap, setVenueMap] = useState(new Map())
  const [macRegistrationPoolMap, setMacRegistrationPoolMap] = useState(new Map())
  const [dpskPoolMap, setDpskPoolMap] = useState(new Map())
  const [pinPoolMap, setPinPoolMap] = useState(new Map())
  const [certTemplateMap, setCertTemplateMap] = useState(new Map())
  const [drawerState, setDrawerState] = useState({
    isEdit: false,
    visible: false,
    data: {} as PersonaGroup | undefined
  })
  const { setIdentityGroupCount } = useContext(IdentityGroupContext)

  const [getVenues] = useLazyVenuesListQuery()
  const [getCertTemplate] = useLazyGetCertificateTemplateQuery()
  const [getDpskById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getPinById] = useLazyGetEdgePinByIdQuery()
  const [downloadCsv] = useLazyDownloadPersonaGroupsQuery()
  const [
    deletePersonaGroup,
    { isLoading: isDeletePersonaGroupUpdating }
  ] = useDeletePersonaGroupMutation()

  const settingsId = 'persona-group-table'
  const tableQuery = useTableQuery( {
    useQuery: useSearchPersonaGroupListQuery,
    apiParams: { sort: 'name,ASC' },
    defaultPayload: { keyword: '' },
    pagination: { settingsId }
  })
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isIdentityRefactorEnabled = useIsSplitOn(Features.IDENTITY_UI_REFACTOR)

  useEffect(() => {
    if (tableQuery.isLoading) return

    const venueIds: string[] = []
    const macPools = new Map()
    const dpskPools = new Map()
    const pinPools = new Map()
    const certTemplates = new Map()

    tableQuery.data?.data.forEach(personaGroup => {
      const {
        macRegistrationPoolId,
        dpskPoolId,
        propertyId,
        personalIdentityNetworkId,
        certificateTemplateId
      } = personaGroup

      if (propertyId) {
        venueIds.push(propertyId)
      }

      if (isCertTemplateEnabled && certificateTemplateId) {
        getCertTemplate({ params: { policyId: certificateTemplateId } })
          .then(result => {
            if (result.data) {
              certTemplates.set(certificateTemplateId, result.data.name)
            }
          })
      }

      if (macRegistrationPoolId) {
        getMacRegistrationById({ params: { policyId: macRegistrationPoolId } })
          .then(result => {
            if (result.data) {
              macPools.set(macRegistrationPoolId, result.data.name)
            }
          })
      }

      if (dpskPoolId) {
        getDpskById({ params: { serviceId: dpskPoolId } })
          .then(result => {
            if (result.data) {
              dpskPools.set(dpskPoolId, result.data.name)
            }
          })
      }

      if (networkSegmentationEnabled && personalIdentityNetworkId) {
        getPinById({ params: { tenantId, serviceId: personalIdentityNetworkId } })
          .then(result => {
            if (result.data) {
              pinPools.set(personalIdentityNetworkId, result.data.name)
            }
          })
      }
    })

    if (venueIds.length !== 0) {
      const payload = { ...defaultVenueListPayload, filters: { id: venueIds } }
      getVenues({ params: { tenantId }, payload })
        .then(result => {
          if (result?.data?.data) {
            setVenueMap(new Map(result.data.data.map(v => [v.id, v.name])))
          }
        })
    }

    setDpskPoolMap(dpskPools)
    setMacRegistrationPoolMap(macPools)
    setPinPoolMap(pinPools)
    setCertTemplateMap(certTemplates)
  }, [tableQuery.data])

  const downloadPersonaGroups = () => {
    downloadCsv({ payload: tableQuery.payload }).unwrap().catch((error) => {
      console.log(error) // eslint-disable-line no-console
    })
  }

  const doDelete = (selectedRow: PersonaGroup, callback: () => void) => {
    const { id, name } = selectedRow
    doProfileDelete(
      [selectedRow],
      $t({ defaultMessage: 'Identity Group' }),
      name,
      [
        {
          fieldName: 'personalIdentityNetworkId',
          fieldText: $t({ defaultMessage: 'Personal Identity Network' })
        },
        // eslint-disable-next-line max-len
        { fieldName: 'propertyId', fieldText: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }) }
      ],
      async () => deletePersonaGroup({ params: { groupId: id } })
        .then(() => {
          callback()
        })
    )
  }

  const actions: TableProps<PersonaGroup>['actions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [{
        label: $t({ defaultMessage: 'Add Identity Group' }),
        rbacOpsIds: [getOpsApi(PersonaUrls.addPersonaGroup)],
        onClick: () => {
          if (isIdentityRefactorEnabled) {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/create`
            })
          } else {
            setDrawerState({ isEdit: false, visible: true, data: undefined })
          }
        }
      }] : []

  const rowActions: TableProps<PersonaGroup>['rowActions'] =
    hasCrossVenuesPermission({ needGlobalPermission: true })
      ? [
        {
          label: $t({ defaultMessage: 'Edit' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.updatePersonaGroup)],
          onClick: ([data], clearSelection) => {
            if (isIdentityRefactorEnabled) {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/${data.id}/edit`
              })
            } else {
              setDrawerState({ data, isEdit: true, visible: true })
            }
            clearSelection()
          }
        },
        {
          label: $t({ defaultMessage: 'Delete' }),
          rbacOpsIds: [getOpsApi(PersonaUrls.deletePersonaGroup)],
          disabled: (([selectedItem]) =>
            selectedItem
              ? (selectedItem.identityCount ?? 0) > 0 || !!selectedItem.certificateTemplateId
              : false
          ),
          onClick: ([selectedRow], clearSelection) => {
            doDelete(selectedRow, clearSelection)
          }
        }
      ] : []

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      keyword: customSearch?.searchString ?? '',
      dpskPoolId: Array.isArray(customFilters?.dpskPoolId)
        ? customFilters?.dpskPoolId[0] : undefined,
      macRegistrationPoolId: Array.isArray(customFilters?.macRegistrationPoolId)
        ? customFilters?.macRegistrationPoolId[0] : undefined,
      personalIdentityNetworkId: Array.isArray(customFilters?.personalIdentityNetworkId)
        ? customFilters?.personalIdentityNetworkId[0] : undefined,
      propertyId: Array.isArray(customFilters?.propertyId)
        ? customFilters?.propertyId[0] : undefined,
      certificateTemplateId: Array.isArray(customFilters?.certificateTemplateId)
        ? customFilters?.certificateTemplateId[0] : undefined
    }

    tableQuery.setPayload(payload)
  }

  setIdentityGroupCount?.(tableQuery.data?.totalCount || 0)

  useTrackLoadTime({
    itemName: widgetsMapping.IDENTITY_GUOUP_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeletePersonaGroupUpdating }
      ]}
    >
      <Table<PersonaGroup>
        enableApiFilter
        settingsId={settingsId}
        // eslint-disable-next-line max-len
        columns={useColumns(macRegistrationPoolMap, dpskPoolMap, venueMap, pinPoolMap, certTemplateMap)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={
          filterByAccess(rowActions).length !== 0 && { type: 'radio' }}
        iconButton={{
          icon: <DownloadOutlined data-testid={'export-persona-group'} />,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: downloadPersonaGroups
        }}
      />

      <PersonaGroupDrawer
        data={drawerState.data}
        isEdit={drawerState.isEdit}
        visible={drawerState.visible}
        onClose={() => setDrawerState({ isEdit: false, visible: false, data: undefined })}
      />
    </Loader>
  )
}
