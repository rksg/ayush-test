import { useEffect, useState } from 'react'

import {
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Drawer,
  Alert,
  cssStr,
  Modal,
  ModalType,
  Button,
  Table,
  TableProps,
  Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                    from '@acx-ui/formatter'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType, NetworkForm } from '@acx-ui/rc/components'
import {
  useGetGuestsListQuery,
  useWifiNetworkListQuery,
  useImportGuestPassMutation
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  Guest,
  GuestTypesEnum,
  transformDisplayText,
  GuestStatusEnum,
  Network,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  FILTER,
  SEARCH,
  ClientInfo,
  ClientUrlsInfo,
  CommonRbacUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum, RequestPayload, WifiScopes }             from '@acx-ui/types'
import {
  hasCrossVenuesPermission,
  hasRoles,
  hasPermission,
  hasAllowedOperations,
  getUserProfile
} from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { defaultGuestPayload, GuestsDetail, isEnabledGeneratePassword } from '../GuestsDetail'
import { GenerateNewPasswordModal }                                     from '../GuestsDetail/generateNewPasswordModal'
import { useGuestActions }                                              from '../GuestsDetail/guestActions'

import {
  AddGuestDrawer,
  GuestFields,
  GuestResponse,
  showNoSendConfirm,
  useHandleGuestPassResponse
} from './addGuestDrawer'

const defaultGuestNetworkPayload = {
  fields: ['name', 'defaultGuestCountry', 'id', 'captiveType'],
  sortField: 'name',
  sortOrder: 'ASC',
  filters: {
    nwSubType: [NetworkTypeEnum.CAPTIVEPORTAL]
  },
  pageSize: 10000
}

export const operationRoles =
[RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR, RolesEnum.GUEST_MANAGER]

export const GuestsTable = () => {
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const params = useParams()

  const isGuestManualPasswordEnabled = useIsSplitOn(Features.GUEST_MANUAL_PASSWORD_TOGGLE)
  const isReadOnly = !hasCrossVenuesPermission() || hasRoles(RolesEnum.READ_ONLY)
  const addNetworkOpsApi = getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)
  const hasAddNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([addNetworkOpsApi])
    : (hasCrossVenuesPermission() && hasPermission({
      scopes: [WifiScopes.CREATE]
    }))

  const filters = {
    includeExpired: ['true']
  }

  const queryOptions = {
    defaultPayload: {
      ...defaultGuestPayload,
      filters
    },
    search: {
      searchTargetFields: ['name', 'mobilePhoneNumber', 'emailAddress']
    }
  }

  const tableQuery = useTableQuery({
    useQuery: useGetGuestsListQuery,
    ...queryOptions
  })

  const networkListQuery = useTableQuery<Network, RequestPayload<unknown>, unknown>({
    useQuery: useWifiNetworkListQuery,
    defaultPayload: defaultGuestNetworkPayload
  })
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const notificationMessage =
    <span style={{
      display: 'grid',
      gridTemplateColumns: '400px 100px',
      paddingTop: '2px'
    }}>
      <span>
        {$t({ defaultMessage: 'Guests cannot be added since there are no guest networks' })}
      </span>
      { hasAddNetworkPermission &&
        <Button type='link'
          onClick={() => setNetworkModalVisible(true)}
          size='small'>
          {$t({ defaultMessage: 'Add Guest Pass Network' })}
        </Button>
      }

    </span>

  const guestAction = useGuestActions()

  const [visible, setVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const [currentGuest, setCurrentGuest] = useState({} as Guest)
  const [guestDetail, setGuestDetail] = useState({} as Guest)
  const [allowedNetworkList, setAllowedNetworkList] = useState<Network[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [guestNetworkList, setGuestNetworkList] = useState<Network[]>([])

  const [importVisible, setImportVisible] = useState(false)
  const [importCsv, importResult] = useImportGuestPassMutation()

  const { handleGuestPassResponse } = useHandleGuestPassResponse()
  const HAEmailList_FeatureFlag = useIsSplitOn(Features.HOST_APPROVAL_EMAIL_LIST_TOGGLE)

  const guestTypeFilterOptions = Object.values(GuestTypesEnum)
    .filter(gtype => gtype!==GuestTypesEnum.HOST_GUEST)
    .map(gtype => ({ key: gtype, value: renderGuestType(gtype) }))

  const networkFilterOptions = allowedNetworkList.map(network=>({
    key: network.id, value: network.name
  }))

  const networkOptions = guestNetworkList.map(network=>({
    key: network.id, value: network.name
  }))

  const navigate = useNavigate()
  const linkToUser = useTenantLink('/users/wifi/guests')
  const getNetworkForm = <NetworkForm modalMode={true}
    modalCallBack={()=>{
      setNetworkModalVisible(false)
      networkListQuery.refetch()
      navigate(linkToUser)
    }}
    createType={NetworkTypeEnum.CAPTIVEPORTAL}
  />

  useEffect(() => {
    if (networkListQuery.data?.data) {
      const networks = networkListQuery.data?.data ?? []
      const networksWithGuestPass = networks.filter(network => {
        return [
          GuestNetworkTypeEnum.GuestPass,
          GuestNetworkTypeEnum.HostApproval,
          GuestNetworkTypeEnum.SelfSignIn,
          GuestNetworkTypeEnum.Directory
        ].includes(network.captiveType ?? GuestNetworkTypeEnum.GuestPass)
      })
      setGuestNetworkList(networks)
      setAllowedNetworkList(networksWithGuestPass)
    }
  }, [networkListQuery.data])

  useEffect(()=>{
    if (importResult.isSuccess) {
      setImportVisible(false)
      handleGuestPassResponse(importResult.data as GuestResponse)
    }
  },[importResult])

  const importRequestHandler = (formData: FormData, values: Guest) => {
    // flat object (2 level)
    Object.entries(values).forEach(([key, value])=>{
      if (Array.isArray(value)) {
        formData.append(key, value.join(','))
      } else if (typeof value === 'object'){
        Object.entries(value).forEach(([subKey, subValue])=>{
          formData.append(`${key}.${subKey}`, subValue as string)
        })
      } else {
        formData.append(key, value as string)
      }
    })
    importCsv({
      params: { tenantId: params.tenantId, networkId: values.wifiNetworkId }, payload: formData
    })
  }

  const onClickGuest = (guest: Guest) => {
    const networkName = guestNetworkList
      .filter(network => network.id === guest.wifiNetworkId)[0]?.name ?? ''
    const clients: ClientInfo[] = []
    guest.clients?.forEach(client => {
      clients.push({ ...client })
    })
    setCurrentGuest({ ...guest,
      ssid: networkName,
      clients: clients.length > 0 ? clients : undefined })
    setVisible(true)
  }

  const columns: TableProps<Guest>['columns'] = [
    {
      key: 'creationDate',
      title: $t({ defaultMessage: 'Created' }),
      dataIndex: 'creationDate',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      filterable: true,
      filterKey: 'fromTime',
      filterComponent: { type: 'rangepicker' },
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => onClickGuest(row)}
        >
          {formatter(DateFormatEnum.DateTimeFormat)(row.creationDate)}
        </Button>
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row, __, highlightFn) =>
        <Button
          size='small'
          type='link'
          onClick={() => onClickGuest(row)}
          children={highlightFn(row.name as string)}
        />
    }, {
      key: 'mobilePhoneNumber',
      title: $t({ defaultMessage: 'Phone' }),
      dataIndex: 'mobilePhoneNumber',
      searchable: true,
      sorter: true
    }, {
      key: 'emailAddress',
      title: $t({ defaultMessage: 'E-mail' }),
      dataIndex: 'emailAddress',
      searchable: true,
      sorter: true
    }, {
      key: 'guestType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'guestType',
      filterable: guestTypeFilterOptions,
      filterMultiple: false,
      sorter: true,
      render: function (_, row) {
        return renderGuestType(row.guestType)
      }
    }, {
      key: 'ssid',
      title: $t({ defaultMessage: 'Network' }),
      dataIndex: 'wifiNetworkId',
      filterKey: 'wifiNetworkId',
      filterable: networkFilterOptions,
      sorter: true,
      render: function (_, row) {
        return renderAllowedNetwork(row, networkOptions)
      }
    }, {
      key: 'expiryDate',
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expiryDate',
      sorter: true,
      filterKey: 'includeExpired',
      filterable: true,
      filterComponent: { type: 'checkbox', label: $t({ defaultMessage: 'Show expired guests' }) },
      defaultFilteredValue: [true],
      render: function (_, row) {
        return renderExpires(row)
      }
    }, {
      key: 'guestStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'guestStatus',
      sorter: false,
      render: function (_, { guestStatus }) {
        return guestStatus === GuestStatusEnum.EXPIRED
          ? <span style={{ color: cssStr('--acx-semantics-red-50') }}>{guestStatus}</span>
          : guestStatus
      }
    },
    ...( HAEmailList_FeatureFlag ? [
      {
        key: 'Approver',
        title: $t({ defaultMessage: 'Approver' }),
        dataIndex: 'hostApprovalEmail',
        filterable: false,
        show: false
      }
    ]: [])
  ]

  const onClose = () => {
    setVisible(false)
  }

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  const rowActions: TableProps<Guest>['rowActions'] = isReadOnly ? [
    {
      label: $t({ defaultMessage: 'Download Information' }),
      onClick: (selectedRows) => {
        guestAction.showDownloadInformation(selectedRows, params.tenantId)
      }
    }
  ] : [
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [WifiScopes.DELETE],
      rbacOpsIds: [getOpsApi(ClientUrlsInfo.deleteGuest)],
      roles: operationRoles,
      onClick: (selectedRows:Guest[]) => {
        guestAction.showDeleteGuest(selectedRows, params.tenantId, clearSelection)
      }
    },
    {
      key: 'downloadInformation',
      label: $t({ defaultMessage: 'Download Information' }),
      scopeKey: [WifiScopes.READ],
      roles: operationRoles,
      onClick: (selectedRows:Guest[]) => {
        guestAction.showDownloadInformation(selectedRows, params.tenantId)
      }
    },
    {
      key: 'generatePassword',
      label: $t({ defaultMessage: 'Generate New Password' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(ClientUrlsInfo.generateGuestPassword)],
      roles: operationRoles,
      visible: (selectedRows:Guest[]) => {
        if (selectedRows.length !== 1) { return false }
        const guestDetail = selectedRows[0]
        return isEnabledGeneratePassword(guestDetail)
      },
      onClick: (selectedRows:Guest[]) => {
        setGuestDetail(selectedRows[0])
        setGenerateModalVisible(true)
      }
    },
    {
      key: 'disableGuest',
      label: $t({ defaultMessage: 'Disable' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(ClientUrlsInfo.disableGuests)],
      roles: operationRoles,
      visible: (selectedRows:Guest[]) => {
        return selectedRows.length === 1 &&
          !_.isEmpty(selectedRows[0].wifiNetworkId) &&
          (selectedRows[0].guestStatus !== GuestStatusEnum.DISABLED) &&
          (selectedRows[0].guestStatus !== GuestStatusEnum.EXPIRED)
      },
      onClick: (selectedRows:Guest[]) =>
      { guestAction.disableGuest(selectedRows[0], params.tenantId)}
    },
    {
      key: 'enableGuest',
      label: $t({ defaultMessage: 'Enable' }),
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(ClientUrlsInfo.enableGuests)],
      roles: operationRoles,
      visible: (selectedRows:Guest[]) => {
        return selectedRows.length === 1 &&
          !_.isEmpty(selectedRows[0].wifiNetworkId) &&
          (selectedRows[0].guestStatus === GuestStatusEnum.DISABLED)
      },
      onClick: (selectedRows:Guest[]) =>
      { guestAction.enableGuest(selectedRows[0], params.tenantId)}
    }
  ].filter(item =>
    hasPermission({ scopes: item.scopeKey, rbacOpsIds: item.rbacOpsIds, roles: item.roles }))

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    if (customFilters.guestType?.includes('SelfSign')) {
      customFilters.guestType.push('HostGuest')
    }
    if(customFilters?.includeExpired){
      customFilters = {
        ...customFilters,
        includeExpired: [customFilters.includeExpired[0].toString()]
      }
    }
    tableQuery.handleFilterChange(customFilters,customSearch)
  }



  return (
    <Loader states={[
      tableQuery
    ]}>
      {
        allowedNetworkList.length === 0 &&
        <Alert message={notificationMessage} type='info' showIcon ></Alert>
      }
      <Table
        settingsId='guest-table'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
        filterableWidth={155}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{
          selectedRowKeys,
          type: 'checkbox'
        }}
        actions={[{
          key: 'addGuest',
          scopeKey: [WifiScopes.CREATE],
          rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.addGuestPass)],
          roles: operationRoles,
          label: $t({ defaultMessage: 'Add Guest' }),
          onClick: () => setDrawerVisible(true),
          disabled: allowedNetworkList.length === 0 ? true : false
        },
        ...( hasAddNetworkPermission? [{
          key: 'addNetworks',
          scopeKey: [WifiScopes.CREATE],
          rbacOpsIds: [addNetworkOpsApi],
          roles: operationRoles.filter(role => role !== RolesEnum.GUEST_MANAGER),
          label: $t({ defaultMessage: 'Add Guest Pass Network' }),
          onClick: () => {setNetworkModalVisible(true) }
        }] : []),
        {
          key: 'importGuests',
          scopeKey: [WifiScopes.CREATE],
          rbacOpsIds: [getOpsApi(ClientUrlsInfo.importGuestPass)],
          roles: operationRoles,
          label: $t({ defaultMessage: 'Import from file' }),
          onClick: () => setImportVisible(true),
          disabled: allowedNetworkList.length === 0 ? true : false
        }]
          .filter(item => {
            const { scopeKey: scopes, rbacOpsIds, roles } = item
            return rbacOpsApiEnabled
              ? hasAllowedOperations([rbacOpsIds])
              : (hasCrossVenuesPermission() && hasPermission({ scopes, roles }))
          })}
      />

      <Drawer
        title={$t({ defaultMessage: 'Guest Details' })}
        visible={visible}
        onClose={onClose}
        children={
          <GuestsDetail
            triggerClose={onClose}
            currentGuest={currentGuest}
          />
        }
        width={'550px'}
      />

      <AddGuestDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
      />
      <ImportFileDrawer
        type={ImportFileDrawerType.GuestPass}
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={250}
        acceptType={['csv']}
        templateLink={
          isGuestManualPasswordEnabled ?
            'assets/templates/guests_import_template_with_guestpass.csv' :
            'assets/templates/guests_import_template.csv'
        }
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={(formData, values)=>{
          const formValues = values as Guest
          if(formValues.deliveryMethods.length === 0){
            showNoSendConfirm(()=>{
              importRequestHandler(formData, formValues)
            })
          } else {
            importRequestHandler(formData, formValues)
          }
        }}
        onClose={() => setImportVisible(false)} >
        <GuestFields withBasicFields={false} />
      </ImportFileDrawer>
      <GenerateNewPasswordModal {...{
        generateModalVisible, setGenerateModalVisible, guestDetail, tenantId: params.tenantId
      }} />
      <Modal
        title={$t({ defaultMessage: 'Add Guest Pass Network' })}
        type={ModalType.ModalStepsForm}
        visible={networkModalVisible}
        mask={true}
        children={getNetworkForm}
      />
    </Loader>
  )
}

export const renderAllowedNetwork =
(currentGuest: Guest, networkList?: { key: string, value: string }[]) => {
  const { $t } = getIntl()
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  const ssid = networkList ? networkList
    .filter(network => network.key === currentGuest.wifiNetworkId)[0]?.value : currentGuest.ssid
  if (isGuestManager) {
    return ssid
  } else if (currentGuest.wifiNetworkId && ssid) {
    return (
      <TenantLink to={`/networks/wireless/${currentGuest.wifiNetworkId}/network-details/overview`}>
        {ssid}</TenantLink>
    )
  } else {
    return $t({ defaultMessage: 'None [Network modified or deleted]' })
  }
}

export const renderExpires = function (row: Guest) {
  const { $t } = getIntl()
  let expiresTime = ''
  if (row.expiryDate && row.expiryDate !== '0') {
    expiresTime = formatter(DateFormatEnum.DateTimeFormat)(row.expiryDate)
  } else if (!row.expiryDate || row.expiryDate === '0') {
    let result = ''
    if (row.passDurationHours) {
      if (row.passDurationHours > 24) {
        const days = Math.floor(row.passDurationHours / 24)
        const hours = row.passDurationHours % 24
        const dayText = days > 1 ?
          $t({ defaultMessage: 'days' }) : $t({ defaultMessage: 'day' })
        const hourText = hours > 1 ?
          $t({ defaultMessage: 'hours' }) : $t({ defaultMessage: 'hour' })
        const daysStr = days > 0 ? `${days} ${dayText}` : ''
        const hoursStr = hours > 0 ? `${hours} ${hourText}` : ''
        result = `${daysStr} ${hoursStr}`
      } else {
        result = row.passDurationHours +
          (row.passDurationHours === 1 ?
            $t({ defaultMessage: 'hour' }) : $t({ defaultMessage: 'hours' }))
      }
    }
    expiresTime = `${result} ${$t({ defaultMessage: 'since first login' })}`
  }
  return expiresTime
}

export const renderGuestType = (value: string) => {
  const { $t } = getIntl()
  let result = ''
  switch (value) {
    case GuestTypesEnum.MANAGED:
      result = $t({ defaultMessage: 'Managed' })
      break
    case GuestTypesEnum.SELF_SIGN_IN:
      result = $t({ defaultMessage: 'Self Sign In' })
      break
    case GuestTypesEnum.DIRECTORY:
      result = $t({ defaultMessage: 'Directory' })
      break
    default:
      result = transformDisplayText(value)
      break
  }
  return result
}
