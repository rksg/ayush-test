import { useMemo, useState } from 'react'

import { FormInstance, Input } from 'antd'
import { NamePath }            from 'antd/lib/form/interface'
import { DefaultOptionType }   from 'antd/lib/select'
import { isNil }               from 'lodash'
import { AlignType }           from 'rc-table/lib/interface'
import { useIntl }             from 'react-intl'

import { Loader, Select, Table, TableProps }                                                                                                                                                                                                                                                from '@acx-ui/components'
import { transToOptions }                                                                                                                                                                                                                                                                   from '@acx-ui/edge/components'
import { useGetEdgeClusterListQuery, useVenueNetworkActivationsViewModelListQuery }                                                                                                                                                                                                         from '@acx-ui/rc/services'
import { ClusterHighAvailabilityModeEnum, defaultSort, EdgeClusterStatus, IncompatibilityFeatures, isOweTransitionNetwork, MtuTypeEnum, Network, NetworkSegmentTypeEnum, NetworkType, NetworkTypeEnum, sortProp, TunnelProfileViewData, TunnelTypeEnum, useHelpPageLink, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { WifiScopes }                                                                                                                                                                                                                                                                       from '@acx-ui/types'
import { filterByAccess }                                                                                                                                                                                                                                                                   from '@acx-ui/user'
import { compareVersions, getIntl, getOpsApi, useTableQuery }                                                                                                                                                                                                                               from '@acx-ui/utils'

import { AddNetworkModal } from '../../NetworkForm'

import { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'
import { ValidationMessageField }      from './styledComponents'

const getRowDisabledInfo = (
  row: Network,
  dsaeOnboardNetworkIds?: string[],
  pinNetworkIds?: string[],
  softGreNetworkIds?: string[]
) => {
  const { $t } = getIntl()
  let disabled = false
  let tooltip = undefined

  if (isOweTransitionNetwork(row)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is OWE transition network, cannot be SD-LAN traffic network.' })
  } else if (dsaeOnboardNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is an onboarding network for WPA3-DPSK3 for DPSK, cannot be SD-LAN traffic network.' })
  } else if (pinNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This network is already used in Personal Identity Network, cannot be SD-LAN traffic network.' })
  } else if (softGreNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This network already has SoftGRE enabled and cannot be used for SD-LAN traffic.' })
  }

  return { disabled, tooltip }
}

const getFilteredTunnelProfileOptions = (
  row: Network,
  tunnelProfileOptions: DefaultOptionType[],
  availableTunnelProfiles: TunnelProfileViewData[]
) => {
  const { $t } = getIntl()
  const isVlanPooling = !isNil(row.vlanPool)
  const isCaptivePortal = row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL

  return tunnelProfileOptions
    .map(item => {
      if(item.value) {
        const profile = availableTunnelProfiles?.find(profile => profile.id === item.value)

        // Skip none VLAN_VXLAN tunnel profile options
        if(profile?.type !== NetworkSegmentTypeEnum.VLAN_VXLAN) {
          return null
        }

        // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
        if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return null
        }

        // Skip VXLAN-GPE options for captive portal networks with non-manual MTU or NAT traversal enabled
        // eslint-disable-next-line max-len
        if(isCaptivePortal && (profile?.mtuType !== MtuTypeEnum.MANUAL || profile?.natTraversalEnabled)) {
          return null
        }

        // Disable VXLAN-GPE options for vlan pooling networks
        if (isVlanPooling && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return {
            ...item,
            disabled: true,
            title: $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
          }
        }
      }

      return item
    })
    .filter((item): item is DefaultOptionType => item !== null)
}

export interface NetworkActivationType {
  [venueId: string]: {
    networkId: string
    networkName: string
    tunnelProfileId?: string
  }[]
}

interface NetworkSelectTableProps {
  venueId: string
  onActivateChange?: ((
    data: Network,
    checked: boolean,
    ) => void) | ((
    data: Network,
    checked: boolean,
    ) => Promise<void>)
  onTunnelProfileChange?: ((data: Network, tunnelProfileId: string, namePath?: NamePath) => void) |
    ((data: Network, tunnelProfileId: string, namePath?: NamePath) => Promise<void>)
  validationFormRef?: FormInstance
  pinNetworkIds?: string[]
  softGreNetworkIds?: string[]
  activated?: NetworkActivationType
  dcTunnelProfileId?: string
  availableTunnelProfiles?: TunnelProfileViewData[]
  requiredFwMap?: {
    [key: string]: string | undefined // [IncompatibilityFeatures]: compatible version
  }
  edgeClusters?: EdgeClusterStatus[]
  isUpdating?: boolean
}

export const NetworkSelectTable = (props: NetworkSelectTableProps) => {
  const {
    venueId, onActivateChange, onTunnelProfileChange, validationFormRef, pinNetworkIds,
    activated = {}, softGreNetworkIds, availableTunnelProfiles = [], dcTunnelProfileId,
    requiredFwMap = {}, edgeClusters = [], isUpdating
  } = props
  const { $t } = useIntl()
  const helpUrl = useHelpPageLink()
  const [networkModalVisible, setNetworkModalVisible] = useState(false)

  const tableQuery = useTableQuery<Network>({
    useQuery: useVenueNetworkActivationsViewModelListQuery,
    defaultPayload: {
      sortField: 'name',
      sortOrder: 'ASC',
      fields: [
        'id',
        'name',
        'nwSubType',
        'vlanPool', // for GUI trigger vlan pooling API in RBAC version
        'dsaeOnboardNetwork'
      ],
      filters: {
        'venueApGroups.venueId': [venueId]
      }
    },
    option: {
      skip: !Boolean(venueId)
    }
  })

  const { edgeClustersFromApi } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'hasCorePort', 'highAvailabilityMode', 'edgeList'],
      filters: {
        clusterId: availableTunnelProfiles?.map(profile =>
          profile.destinationEdgeClusterId).filter(Boolean)
      },
      pageSize: 10000
    }
  }, {
    skip: !!edgeClusters?.length || !availableTunnelProfiles?.length,
    selectFromResult: ({ data }) => ({
      edgeClustersFromApi: data?.data
    })
  })

  const associatedEdgeClusters = useMemo(() => {
    return edgeClusters.length > 0 ? edgeClusters : edgeClustersFromApi
  }, [edgeClusters, edgeClustersFromApi])

  const networkFormDefaultVals = useMemo(() =>
    (venueId ? { defaultActiveVenues: [venueId] } : undefined)
  ,[venueId])

  const tunnelProfileOptions = useMemo(() => {
    const dcTunnelProfileBoundClusterId = availableTunnelProfiles?.find(profile =>
      profile.id === dcTunnelProfileId)?.destinationEdgeClusterId

    const dcCluster = associatedEdgeClusters?.find(
      cluster => cluster.clusterId === dcTunnelProfileBoundClusterId
    )

    const isSupportL2Gre = dcCluster?.edgeList?.every(
      // eslint-disable-next-line max-len
      edge => compareVersions(edge.firmwareVersion, requiredFwMap[IncompatibilityFeatures.L2OGRE]) > -1
    ) && dcCluster.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE

    const filteredTunnelOptions = availableTunnelProfiles?.filter(profile =>
      (isSupportL2Gre || profile.tunnelType !== TunnelTypeEnum.L2GRE) &&
      profile.id !== dcTunnelProfileId)

    const usedTunnelProfileIds = Object.values(activated)
      .flatMap(item => item.map(item => item.tunnelProfileId ?? ''))

    return [
      {
        label: $t({ defaultMessage: 'Core Port' }),
        value: ''
      },
      ...transToOptions(filteredTunnelOptions, usedTunnelProfileIds)
    ]
  }, [availableTunnelProfiles, activated, associatedEdgeClusters, dcTunnelProfileId, requiredFwMap])

  const currentNetworkList = activated?.[venueId]

  const dsaeOnboardNetworkIds = (tableQuery.data?.data
    .map(item => item.dsaeOnboardNetwork?.id)
    .filter(i => !isNil(i)) ?? []) as string[]

  const handleTunnelProfileChange = (row: Network, value: string, namePath: NamePath) => {
    onTunnelProfileChange?.(row, value, namePath)
    validationFormRef?.validateFields([namePath])
  }

  const checkCorePortConfigured = (tunnelProfileId?: string) => {
    const targetTunnelProfile = availableTunnelProfiles?.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)

    if(!tunnelProfileId || targetTunnelProfile?.tunnelType === TunnelTypeEnum.L2GRE) {
      return Promise.resolve()
    }

    const associatedEdgeCluster = associatedEdgeClusters?.find((cluster) =>
      cluster.clusterId === targetTunnelProfile?.destinationEdgeClusterId)
    if (associatedEdgeCluster?.hasCorePort) {
      return Promise.resolve()
    } else {
      return Promise.reject(
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'To use the SD-LAN service, each RUCKUS Edge within the cluster must set up a Core port or Core LAG. {infoLink}' },
          {
            infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
              {$t({ defaultMessage: 'See more information' })}
            </a>
          }))
    }
  }

  const columns: TableProps<Network>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: 'Active Network' }),
    tooltip: $t({ defaultMessage:
        // eslint-disable-next-line max-len
        'A list of the networks that have been activated on this <venueSingular></venueSingular>.' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Network Type' }),
    key: 'nwSubType',
    dataIndex: 'nwSubType',
    sorter: { compare: sortProp('nwSubType', defaultSort) },
    render: (_, row) => {
      return <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    }
  }, {
    title: $t({ defaultMessage: 'Enable Tunnel' }),
    key: 'action',
    dataIndex: 'action',
    align: 'center' as AlignType,
    width: 80,
    render: (_: unknown, row: Network) => {
      // eslint-disable-next-line max-len
      const disabledInfo = getRowDisabledInfo(row, dsaeOnboardNetworkIds, pinNetworkIds, softGreNetworkIds)

      return <ActivateNetworkSwitchButton
        row={row}
        activated={currentNetworkList?.map(item => item.networkId) ?? []}
        disabled={disabledInfo.disabled}
        tooltip={disabledInfo.tooltip}
        onChange={onActivateChange}
      />
    }
  }, {
    title: $t({ defaultMessage: 'Forward Destination' }),
    key: 'action2',
    dataIndex: 'action2',
    width: 150,
    render: (_: unknown, row: Network, index: number) => {
      const isEnabledTunneling = currentNetworkList?.some(item => item.networkId === row.id)
      // eslint-disable-next-line max-len
      const currentTunnelProfileId = currentNetworkList?.find(item => item.networkId === row.id)?.tunnelProfileId
      // eslint-disable-next-line max-len
      const processedOptions = getFilteredTunnelProfileOptions(row, tunnelProfileOptions, availableTunnelProfiles)
      return isEnabledTunneling && <>
        <Select
          style={{ width: '100%' }}
          value={currentTunnelProfileId ?? ''}
          onChange={(value) => handleTunnelProfileChange(row, value, ['validation', index])}
          options={processedOptions}
        />
        <ValidationMessageField
          name={['validation', index]}
          rules={[{ validator: () => checkCorePortConfigured(currentTunnelProfileId) }]}
          children={<Input hidden />}
        />
      </>
    }
  }
  ]), [
    venueId,
    activated,
    onActivateChange,
    dsaeOnboardNetworkIds,
    pinNetworkIds,
    softGreNetworkIds
  ])

  const actions: TableProps<Network>['actions'] = [{
    scopeKey: [WifiScopes.CREATE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)],
    label: $t({ defaultMessage: 'Add Wi-Fi Network' }),
    onClick: () => {
      setNetworkModalVisible(true)
    }
  }]

  return (
    <>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isUpdating }
      ]}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={tableQuery.data?.data}
          actions={filterByAccess(actions)}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Loader>
      <AddNetworkModal
        visible={networkModalVisible}
        setVisible={setNetworkModalVisible}
        defaultValues={networkFormDefaultVals}
      />
    </>
  )
}