import { useEffect, useState } from 'react'

import {
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import { Drawer }  from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Alert, cssStr, Modal, ModalType } from '@acx-ui/components'
import {
  Button,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { CsvSize, ImportCsvDrawer } from '@acx-ui/rc/components'
import {
  useGetGuestsListQuery,
  useNetworkListQuery,
  useLazyGetGuestNetworkListQuery,
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
  RequestPayload,
  GuestErrorRes
} from '@acx-ui/rc/utils'
import { TenantLink, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                                           from '@acx-ui/utils'

import NetworkForm                           from '../../../../../Networks/wireless/NetworkForm/NetworkForm'
import { defaultGuestPayload, GuestsDetail } from '../GuestsDetail'

import {
  AddGuestDrawer,
  GuestFields,
  GuestResponse,
  showGuestErrorModal,
  showNoSendConfirm,
  useHandleGuestPassResponse
} from './addGuestDrawer'

const payload = {
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

export default function GuestsTable () {
  const defaultGuestNetworkPayload = {
    searchString: '',
    fields: [
      'check-all',
      'name',
      'description',
      'nwSubType',
      'venues',
      'aps',
      'clients',
      'vlan',
      'cog',
      'ssid',
      'vlanPool',
      'captiveType',
      'id'
    ],
    filters: {
      nwSubType: ['guest'],
      captiveType: ['GuestPass']
    }
  }

  const { $t } = useIntl()
  const params = useParams()
  const GuestsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetGuestsListQuery,
      defaultPayload: defaultGuestPayload
    })

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
        <Button type='link'
          onClick={()=> setNetworkModalVisible(true)}
          disabled={!useIsSplitOn(Features.SERVICES)}
          size='small'>
          {$t({ defaultMessage: 'Add Guest Pass Network' })}
        </Button>
      </span>

    const [visible, setVisible] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [currentGuest, setCurrentGuest] = useState({} as Guest)
    const [allowedNetworkList, setAllowedNetworkList] = useState<Network[]>([])

    const [importVisible, setImportVisible] = useState(false)
    const [importCsv, importResult] = useImportGuestPassMutation()

    const { handleGuestPassResponse } = useHandleGuestPassResponse({ tenantId: params.tenantId! })

    const [getNetworkList] = useLazyGetGuestNetworkListQuery()

    const getAllowedNetworkList = async () => {
      const list = await (getNetworkList({ params, payload }, true).unwrap())
      setAllowedNetworkList(list.data)
    }
    const navigate = useNavigate()
    const linkToUser = useTenantLink('/users/wifi/guests')
    const getNetworkForm = <NetworkForm modalMode={true}
      modalCallBack={()=>{
        setNetworkModalVisible(false)
        getAllowedNetworkList()
        navigate(linkToUser)
      }}
      createType={NetworkTypeEnum.CAPTIVEPORTAL}
    />
    useEffect(() => {
      getAllowedNetworkList()
    }, [])

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
      importCsv({ params, payload: formData })
    }

    const columns: TableProps<Guest>['columns'] = [
      {
        key: 'creationDate',
        title: $t({ defaultMessage: 'Created' }),
        dataIndex: 'creationDate',
        sorter: true,
        defaultSortOrder: 'ascend',
        render: (data, row) =>
          <Button
            type='link'
            size='small'
            onClick={() => {
              setCurrentGuest(row)
              setVisible(true)
            }}
          >
            {/* TODO: Wait for framework support userprofile-format dateTimeFormats */}
            {moment(row.creationDate).format('DD/MM/YYYY HH:mm')}
          </Button>
      },
      {
        key: 'name',
        title: $t({ defaultMessage: 'Name' }),
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'ascend',
        render: (data, row) =>
          <Button
            type='link'
            size='small'
            onClick={() => {
              setCurrentGuest(row)
              setVisible(true)
            }}
          >
            {data}
          </Button>
      }, {
        key: 'mobilePhoneNumber',
        title: $t({ defaultMessage: 'Phone' }),
        dataIndex: 'mobilePhoneNumber',
        sorter: true
      }, {
        key: 'emailAddress',
        title: $t({ defaultMessage: 'E-mail' }),
        dataIndex: 'emailAddress',
        sorter: true
      }, {
        key: 'guestType',
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'guestType',
        sorter: true,
        render: function (data, row) {
          return renderGuestType(row.guestType)
        }
      }, {
        key: 'ssid',
        title: $t({ defaultMessage: 'Allowed Network' }),
        dataIndex: 'ssid',
        sorter: true,
        render: function (data, row) {
          return renderAllowedNetwork(row)
        }
      }, {
        key: 'expiryDate',
        title: $t({ defaultMessage: 'Expires' }),
        dataIndex: 'expiryDate',
        sorter: true,
        render: function (data, row) {
          return renderExpires(row)
        }
      }, {
        key: 'guestStatus',
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'guestStatus',
        sorter: false,
        render: function (data) {
          return data === GuestStatusEnum.EXPIRED ?
            <span style={{ color: cssStr('--acx-semantics-red-50') }}>{data}</span> : data
        }
      }
    ]

    const onClose = () => {
      setVisible(false)
    }

    return (
      <Loader states={[
        tableQuery
      ]}>
        {
          !networkListQuery.data?.data?.length &&
          <Alert message={notificationMessage} type='info' showIcon ></Alert>
        }
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          actions={[{
            label: $t({ defaultMessage: 'Add Guest' }),
            onClick: () => setDrawerVisible(true),
            disabled: allowedNetworkList.length === 0 ? true : false
          }, {
            label: $t({ defaultMessage: 'Add Guest Pass Network' }),
            onClick: () => {setNetworkModalVisible(true) },
            disabled: !useIsSplitOn(Features.SERVICES)
          },
          {
            label: $t({ defaultMessage: 'Import from file' }),
            onClick: () => setImportVisible(true),
            disabled: allowedNetworkList.length === 0 ? true : false
          }
          ]}
        />

        <Drawer
          title={$t({ defaultMessage: 'Guest Details' })}
          visible={visible}
          onClose={onClose}
          mask={false}
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
        <ImportCsvDrawer type='GuestPass'
          title={$t({ defaultMessage: 'Import from file' })}
          maxSize={CsvSize['5MB']}
          maxEntries={250}
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
          onClose={()=>setImportVisible(false)} >
          <GuestFields withBasicFields={false} />
        </ImportCsvDrawer>
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

  return (
    <GuestsTable />
  )
}

export const renderAllowedNetwork = function (currentGuest: Guest) {
  const { $t } = getIntl()
  // const hasGuestManagerRole = false   //TODO: Wait for userProfile()
  // if (currentGuest.networkId && !hasGuestManagerRole) {
  //   return (
  //     <TenantLink to={`/networks/${currentGuest.networkId}/network-details/aps`}>
  //       {currentGuest.ssid}</TenantLink>
  //   )
  // } else if (currentGuest.networkId && hasGuestManagerRole) {
  // return currentGuest.ssid
  if (currentGuest.networkId) {
    return (
      <TenantLink to={`/networks/wireless/${currentGuest.networkId}/network-details/aps`}>
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
    // TODO: Wait for framework support userprofile-format dateTimeFormats
    expiresTime = moment(row.expiryDate).format('DD/MM/YYYY HH:mm')
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
    case GuestTypesEnum.HOST_GUEST:
      result = $t({ defaultMessage: 'Self Sign In' })
      break
    default:
      result = transformDisplayText(value)
      break
  }
  return result
}
