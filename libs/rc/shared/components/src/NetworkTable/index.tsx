import { ReactNode, useEffect, useState } from 'react'

import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate, useParams }    from 'react-router-dom'

import { showActionModal, Loader, TableProps, Table  }      from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { useDeleteNetworkMutation, useLazyVenuesListQuery } from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  Network,
  NetworkType,
  TableQuery,
  GuestNetworkTypeEnum,
  checkVenuesNotInSetup,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }            from '@acx-ui/types'
import { filterByAccess }            from '@acx-ui/user'
import { getIntl, noDataDisplay }    from '@acx-ui/utils'


const disabledType: NetworkTypeEnum[] = []

function getCols (intl: ReturnType<typeof useIntl>) {
  function getDpskSecurityProtocol (securityProtocol: WlanSecurityEnum) {
    let _securityProtocol: string = ''
    switch (securityProtocol) {
      case WlanSecurityEnum.WPA2Personal:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA2 (Recommended)' })
        break
      case WlanSecurityEnum.WPAPersonal:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA' })
        break
      case WlanSecurityEnum.WPA23Mixed:
        _securityProtocol = intl.$t({ defaultMessage: 'WPA3/WPA2 mixed mode' })
        break
    }
    return _securityProtocol
  }
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left',
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return row.name
        }else{
          return (row?.isOnBoarded
            ? <span>
              {row.name}
            </span>
            : <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
              {row.name}
              {row.name !== row.ssid &&
                <> {intl.$t({ defaultMessage: '(SSID: {ssid})' }, { ssid: row.ssid })}</>
              }
            </TenantLink>
          )
        }
      }
    },
    {
      key: 'description',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: intl.$t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: intl.$t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return row.venues?.count
        }else{
          return (
            row?.isOnBoarded
              ? <span>{row.venues?.count || 0}</span>
              : <TenantLink
                to={`/networks/wireless/${row.id}/network-details/venues`}
                children={row.venues?.count ? row.venues?.count : 0}
              />
          )
        }
      }
    },
    {
      key: 'aps',
      title: intl.$t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center',
      render: function (_, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return row.aps
        }else{
          return (
            row?.isOnBoarded
              ? <span>{row.aps}</span>
              : <TenantLink to={`/networks/wireless/${row.id}/network-details/aps`}>
                {row.aps}
              </TenantLink>
          )
        }
      }
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: false, // API does not seem to be working
      align: 'center'
    },
    // { TODO: Wait for Services
    //   key: 'services',
    //   title: intl.$t({ defaultMessage: 'Services' }),
    //   dataIndex: 'services',
    //   sorter: true,
    //   align: 'center',
    //   show: isServicesEnabled
    // },
    {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (_, row) {
        return transformVLAN(row)
      }
    },
    {
      key: 'securityProtocol',
      title: intl.$t({ defaultMessage: 'Security Protocol' }),
      dataIndex: 'securityProtocol',
      sorter: false,
      render: (data, row) =>
        getDpskSecurityProtocol(row?.securityProtocol as WlanSecurityEnum) || noDataDisplay
    }
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: intl.$t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: intl.$t({ defaultMessage: 'Tags' }),
    //   dataIndex: 'tags',
    //   sorter: true
    // }
  ]
  return columns
}


const transformVLAN = (row: Network) => {
  const { $t } = getIntl()
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return $t({ defaultMessage: 'VLAN Pool: {poolName}' }, { poolName: vlanPool?.name ?? '' })
  }
  return $t({ defaultMessage: 'VLAN-{id}' }, { id: row.vlan })
}

export const defaultNetworkPayload = {
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
    'id',
    'securityProtocol',
    'dsaeOnboardNetwork',
    'isOweMaster',
    'owePairNetworkId'
  ],
  page: 1,
  pageSize: 2048
}

const rowSelection = (supportOweTransition: boolean) => {
  return {
    getCheckboxProps: (record: Network) => ({
      disabled: !!record?.isOnBoarded
        || disabledType.indexOf(record.nwSubType as NetworkTypeEnum) > -1
        || (supportOweTransition && record?.isOweMaster === false)
    }),
    renderCell: (checked: boolean, record: Network, index: number, node: ReactNode) => {
      if (record?.isOnBoarded) {
        return <></>
      }
      return node
    }
  }
}

/* eslint-disable max-len */
const getDeleteMessage = (messageKey: string) => {
  const { $t } = getIntl()
  const deleteMessageMap = {
    deletingGuestPass: $t({ defaultMessage: 'Deleting Guest Pass network will invalidate all its related guest passes.' }),
    deletingDPSK: $t({ defaultMessage: 'Deleting DPSK network will remove all its related DPSK User Credentials (Passphrases).' }),
    hasAdvertisedVenues: $t({ defaultMessage: 'Note that this will affect the service on all venues and APs that the network is activated on.' })
  }
  return deleteMessageMap?.[messageKey as keyof typeof deleteMessageMap]
}
/* eslint-enable max-len */

interface NetworkTableProps {
  tableQuery: TableQuery<Network, RequestPayload<unknown>, unknown>,
  selectable?: boolean
}

export function NetworkTable ({ tableQuery, selectable }: NetworkTableProps) {
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const isWpaDsae3Toggle = useIsSplitOn(Features.WIFI_EDA_WPA3_DSAE_TOGGLE)
  const [expandOnBoaroardingNetworks, setExpandOnBoaroardingNetworks] = useState<boolean>(false)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)
  const intl = useIntl()
  const { $t } = intl
  const navigate = useNavigate()
  const linkToEditNetwork = useTenantLink('/networks/wireless/')

  useEffect(() => {
    if (tableQuery?.data?.data) {
      const _rows: string[]=[]

      tableQuery?.data?.data.map((record: Network) => {
        if (record?.children) _rows.push(record.id)})

      if (expandOnBoaroardingNetworks) {
        setExpandedRowKeys(_rows)
      } else {
        setExpandedRowKeys([])
      }
    }

  }, [tableQuery?.data?.data, expandOnBoaroardingNetworks])

  const { tenantId } = useParams()
  const [
    deleteNetwork, { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkMutation()
  const [venuesList] = useLazyVenuesListQuery()

  if(!isServicesEnabled){
    disabledType.push(NetworkTypeEnum.CAPTIVEPORTAL)
  }

  async function getAdvertisedVenuesStatus (selectedNetwork: Network) {
    const payload = { fields: ['name', 'status'], filters: { name: selectedNetwork.venues.names } }
    const list = (await venuesList({ params: { tenantId }, payload }, true).unwrap()).data
    return list
  }

  const rowActions: TableProps<Network>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/edit`, { replace: false })
      },
      disabled: (selectedRows) => !isWpaDsae3Toggle && (!!selectedRows[0]?.dsaeOnboardNetwork)
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      onClick: (selectedRows) => {
        navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/clone`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: async ([selected], clearSelection) => {
        const isDeletingDPSK = isSelectedDpskNetwork([selected])
        const isDeletingGuestPass = isSelectedGuestNetwork([selected])
        const networkAdvertisedVenues = await getAdvertisedVenuesStatus(selected)
        const hideConfirmation = selected?.venues?.count === 0
          ? true : !checkVenuesNotInSetup(networkAdvertisedVenues)

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Network' }),
            entityValue: selected.name,
            extraContent: <FormattedMessage
              defaultMessage={`
              <br></br>
              {deletingGuestPass}
              {deletingDPSK}
              <br></br>
              {confirmation}`}
              values={{
                deletingGuestPass: isDeletingGuestPass ? getDeleteMessage('deletingGuestPass') : '',
                deletingDPSK: isDeletingDPSK ? getDeleteMessage('deletingDPSK') : '',
                confirmation: !hideConfirmation ? getDeleteMessage('hasAdvertisedVenues') : '',
                br: () => <br />
              }}
            />,
            ...( !hideConfirmation && { confirmationText: 'Delete' })
          },
          onOk: () => deleteNetwork({ params: { tenantId, networkId: selected.id } })
            .then(clearSelection)
        })
      }
    }
  ]

  function toggleOnboardNetworks () {
    setExpandOnBoaroardingNetworks(!expandOnBoaroardingNetworks)
  }

  const expandable = {
    expandedRowKeys
  }


  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        settingsId='network-table'
        columns={getCols(intl)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        expandedRowKeys={expandedRowKeys}
        expandIconColumnIndex={-1}
        expandIcon={
          () => <></>
        }
        expandable={expandable}
        rowActions={filterByAccess(rowActions)}
        rowSelection={selectable ? { type: 'radio',
          ...rowSelection(supportOweTransition) } : undefined}
        actions={isWpaDsae3Toggle ? [{
          key: 'toggleOnboardNetworks',
          label: expandOnBoaroardingNetworks
            ? $t({ defaultMessage: 'Hide Onboard Networks' })
            : $t({ defaultMessage: 'Show Onboard Networks' }),
          onClick: () => toggleOnboardNetworks()
        }]: []}
      />
    </Loader>
  )
}

function isSelectedGuestNetwork (networks: Network[]) {
  const guestNetworks = networks.filter(network => {
    const { nwSubType, captiveType } = network
    return (nwSubType === NetworkTypeEnum.CAPTIVEPORTAL &&
      captiveType === GuestNetworkTypeEnum.GuestPass)
  })

  return guestNetworks?.length > 0
}

function isSelectedDpskNetwork (networks: Network[]) {
  const dpskNetworks = networks.filter(network => network.nwSubType === NetworkTypeEnum.DPSK)
  return dpskNetworks?.length > 0
}
