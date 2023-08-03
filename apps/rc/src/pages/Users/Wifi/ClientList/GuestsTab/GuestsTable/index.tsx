import { useContext, useEffect, useState } from 'react'

import {
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer, Alert, cssStr, Modal, ModalType } from '@acx-ui/components'
import {
  Button,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                       from '@acx-ui/formatter'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '@acx-ui/rc/components'
import {
  useGetGuestsListQuery,
  useNetworkListQuery,
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
  SEARCH
} from '@acx-ui/rc/utils'
import { TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }                                    from '@acx-ui/types'
import { RolesEnum }                                         from '@acx-ui/types'
import { GuestErrorRes, hasAccess, hasRoles }                from '@acx-ui/user'
import { DateRange, getIntl  }                               from '@acx-ui/utils'

import NetworkForm                           from '../../../../../Networks/wireless/NetworkForm/NetworkForm'
import { GuestDateFilter }                   from '../../index'
import { defaultGuestPayload, GuestsDetail } from '../GuestsDetail'
import { GenerateNewPasswordModal }          from '../GuestsDetail/generateNewPasswordModal'
import { useGuestActions }                   from '../GuestsDetail/guestActions'

import {
  AddGuestDrawer,
  GuestFields,
  GuestResponse,
  showGuestErrorModal,
  showNoSendConfirm,
  useHandleGuestPassResponse
} from './addGuestDrawer'
import { GuestTabContext } from './context'

const defaultGuestNetworkPayload = {
  fields: ['name', 'defaultGuestCountry', 'id'],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000,
  filters: {
    nwSubType: [NetworkTypeEnum.CAPTIVEPORTAL],
    captiveType: [GuestNetworkTypeEnum.GuestPass]
  },
  url: '/api/viewmodel/tenant/{tenantId}/network'
}

export const GuestsTable = ({ dateFilter }: { dateFilter: GuestDateFilter }) => {
  const { $t } = useIntl()
  const params = useParams()
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const isReadOnly = hasRoles(RolesEnum.READ_ONLY)
  const filters = {
    includeExpired: ['true'],
    ...(dateFilter.range === DateRange.allTime ? {} : { dateFilter })
  }
  const { setGuestCount } = useContext(GuestTabContext)

  const tableQuery = useTableQuery({
    useQuery: useGetGuestsListQuery,
    defaultPayload: {
      ...defaultGuestPayload,
      filters: filters
    },
    search: {
      searchTargetFields: ['name', 'mobilePhoneNumber', 'emailAddress']
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ..._.omit(tableQuery.payload.filters, ['dateFilter']),
        ...filters
      }
    })
  }, [dateFilter])

  const networkListQuery = useTableQuery<Network, RequestPayload<unknown>, unknown>({
    useQuery: useNetworkListQuery,
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
      {
        hasAccess() &&
        <Button type='link'
          onClick={() => setNetworkModalVisible(true)}
          disabled={!isServicesEnabled}
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

  const [importVisible, setImportVisible] = useState(false)
  const [importCsv, importResult] = useImportGuestPassMutation()

  const { handleGuestPassResponse } = useHandleGuestPassResponse({ tenantId: params.tenantId! })

  const guestTypeFilterOptions = Object.values(GuestTypesEnum)
    .filter(gtype => gtype!==GuestTypesEnum.HOST_GUEST)
    .map(gtype => ({ key: gtype, value: renderGuestType(gtype) }))

  const networkFilterOptions = allowedNetworkList.map(network=>({
    key: network.id, value: network.name
  }))

  const showExpired = () => [
    { key: 'true', text: $t({ defaultMessage: 'Show expired guests' }) },
    { key: 'false', text: $t({ defaultMessage: 'Hide expired guests' }) }
  ] as Array<{ key: string, text: string }>

  const showExpiredOptions = showExpired().map(({ key, text }) => ({
    key, value: text
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
      setAllowedNetworkList(networkListQuery.data?.data)
    }
  }, [networkListQuery.data])

  useEffect(()=>{
    if (importResult.isSuccess) {
      setImportVisible(false)
      handleGuestPassResponse(importResult.data as GuestResponse)
    }
    if (importResult.isError && importResult?.error && 'data' in importResult.error) {
      showGuestErrorModal(importResult?.error.data as GuestErrorRes)
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
      params: { tenantId: params.tenantId, networkId: values.networkId }, payload: formData
    })
  }

  const columns: TableProps<Guest>['columns'] = [
    {
      key: 'creationDate',
      title: $t({ defaultMessage: 'Created' }),
      dataIndex: 'creationDate',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (data, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentGuest(row)
            setVisible(true)
          }}
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
      render: (data, row, __, highlightFn) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentGuest(row)
            setVisible(true)
          }}
        >
          {highlightFn(row.name as string)}
        </Button>
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
      render: function (data, row) {
        return renderGuestType(row.guestType)
      }
    }, {
      key: 'ssid',
      title: $t({ defaultMessage: 'Allowed Network' }),
      dataIndex: 'ssid',
      filterKey: 'networkId',
      filterable: networkFilterOptions || true,
      sorter: true,
      render: function (data, row) {
        return renderAllowedNetwork(row)
      }
    }, {
      key: 'expiryDate',
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expiryDate',
      sorter: true,
      filterKey: 'includeExpired',
      filterMultiple: false,
      filterable: showExpiredOptions || true,
      defaultFilteredValue: ['true'],
      render: function (data, row) {
        return renderExpires(row)
      }
    }, {
      key: 'guestStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'guestStatus',
      sorter: true,
      render: function (data) {
        return data === GuestStatusEnum.EXPIRED ?
          <span style={{ color: cssStr('--acx-semantics-red-50') }}>{data}</span> : data
      }
    }
  ]

  const onClose = () => {
    setVisible(false)
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
      onClick: (selectedRows) => {
        guestAction.showDeleteGuest(selectedRows, params.tenantId)
      }
    },
    {
      label: $t({ defaultMessage: 'Download Information' }),
      onClick: (selectedRows) => {
        guestAction.showDownloadInformation(selectedRows, params.tenantId)
      }
    },
    {
      label: $t({ defaultMessage: 'Generate New Password' }),
      visible: (selectedRows) => {
        if (selectedRows.length !== 1) { return false }
        const guestDetail = selectedRows[0]
        const flag = (guestDetail.guestStatus?.indexOf(GuestStatusEnum.ONLINE) !== -1) ||
        ((guestDetail.guestStatus === GuestStatusEnum.OFFLINE) &&
          guestDetail.networkId && !guestDetail.socialLogin)

        return Boolean(flag)
      },
      onClick: (selectedRows) => {
        setGuestDetail(selectedRows[0])
        setGenerateModalVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Disable' }),
      visible: (selectedRows) => {
        return selectedRows.length === 1 &&
          !_.isEmpty(selectedRows[0].networkId) &&
          (selectedRows[0].guestStatus !== GuestStatusEnum.DISABLED) &&
          (selectedRows[0].guestStatus !== GuestStatusEnum.EXPIRED)
      },
      onClick: (selectedRows) => { guestAction.disableGuest(selectedRows[0], params.tenantId)}
    },
    {
      label: $t({ defaultMessage: 'Enable' }),
      visible: (selectedRows) => {
        return selectedRows.length === 1 &&
          !_.isEmpty(selectedRows[0].networkId) &&
          (selectedRows[0].guestStatus === GuestStatusEnum.DISABLED)
      },
      onClick: (selectedRows) => { guestAction.enableGuest(selectedRows[0], params.tenantId)}
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    if (customFilters.guestType?.includes('SelfSign')) {
      customFilters.guestType.push('HostGuest')
    }
    tableQuery.handleFilterChange(customFilters,customSearch)
  }

  setGuestCount?.(tableQuery.data?.totalCount || 0)
  return (
    <Loader states={[
      tableQuery
    ]}>
      {
        allowedNetworkList.length === 0 &&
        <Alert message={notificationMessage} type='info' showIcon ></Alert>
      }
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{
          type: 'checkbox'
        }}
        actions={[{
          key: 'addGuest',
          label: $t({ defaultMessage: 'Add Guest' }),
          onClick: () => setDrawerVisible(true),
          disabled: allowedNetworkList.length === 0 ? true : false
        }, {
          key: 'addGuestNetwork',
          label: $t({ defaultMessage: 'Add Guest Pass Network' }),
          onClick: () => {setNetworkModalVisible(true) },
          disabled: !isServicesEnabled
        },
        {
          key: 'importFromFile',
          label: $t({ defaultMessage: 'Import from file' }),
          onClick: () => setImportVisible(true),
          disabled: allowedNetworkList.length === 0 ? true : false
        }].filter(((item)=> {
          switch(item.key) {
            case 'addGuest':
              return hasRoles([RolesEnum.ADMINISTRATOR,
                RolesEnum.PRIME_ADMIN,RolesEnum.GUEST_MANAGER])
            case 'addGuestNetwork':
              return hasRoles([RolesEnum.ADMINISTRATOR, RolesEnum.PRIME_ADMIN])
            case 'importFromFile':
              return hasRoles([RolesEnum.ADMINISTRATOR,
                RolesEnum.PRIME_ADMIN,RolesEnum.GUEST_MANAGER])
            default:
              return false
          }
        }))}
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
        templateLink='assets/templates/guests_import_template.csv'
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

export const renderAllowedNetwork = function (currentGuest: Guest) {
  const { $t } = getIntl()
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  if (isGuestManager) {
    return currentGuest.ssid
  } else if (currentGuest.networkId) {
    return (
      <TenantLink to={`/networks/wireless/${currentGuest.networkId}/network-details/overview`}>
        {currentGuest.ssid}</TenantLink>
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
        result = `${days} ${dayText} ${hours} ${hourText}`
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
    default:
      result = transformDisplayText(value)
      break
  }
  return result
}
