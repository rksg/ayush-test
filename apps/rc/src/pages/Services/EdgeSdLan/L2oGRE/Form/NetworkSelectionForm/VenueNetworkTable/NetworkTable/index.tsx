/* eslint-disable max-len */
import { useMemo, useState } from 'react'

import { Col, Form, Row }     from 'antd'
import { DefaultOptionType }  from 'antd/es/cascader'
import { find, isNil, merge } from 'lodash'
import { AlignType }          from 'rc-table/lib/interface'
import { useIntl }            from 'react-intl'

import { Loader, Select, Table, TableColumn, TableProps, Tooltip, useStepFormContext } from '@acx-ui/components'
import { transToOptions }                                                              from '@acx-ui/edge/components'
import { AddNetworkModal }                                                             from '@acx-ui/rc/components'
import { useVenueNetworkActivationsViewModelListQuery }                                from '@acx-ui/rc/services'
import {
  defaultSort,
  EdgeMvSdLanFormModel,
  IncompatibilityFeatures,
  isOweTransitionNetwork,
  Network,
  NetworkType,
  NetworkTypeEnum,
  sortProp,
  TunnelProfileViewData,
  TunnelTypeEnum,
  useTableQuery,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { WifiScopes }                          from '@acx-ui/types'
import { filterByAccess }                      from '@acx-ui/user'
import { compareVersions, getIntl, getOpsApi } from '@acx-ui/utils'

import { EdgeSdLanFormType }     from '../../..'
import { useEdgeSdLanContext }   from '../../../EdgeSdLanContextProvider'
import { WarningCircleRed }      from '../../styledComponents'
import { NetworkActivationType } from '../../VenueNetworkTable/NetworksDrawer'

import { ActivateNetworkSwitchButton, ActivateNetworkSwitchButtonProps } from './ActivateNetworkSwitchButton'


// the state of 'Forward the guest traffic to DMZ' (ON/OFF) on the same network at different venues needs to be same
const getRowDisabledInfo = (
  row: Network,
  dsaeOnboardNetworkIds?: string[],
  pinNetworkIds?: string[]
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
    tooltip = $t({ defaultMessage: 'This network already used in Personal Identity Network, cannot be SD-LAN traffic network.' })
  }

  return { disabled, tooltip }
}

export interface ActivatedNetworksTableProps {
  venueId: string
  columnsSetting?: Partial<Omit<TableColumn<Network, 'text'>, 'render'>>[]
  activated?: NetworkActivationType
  disabled?: boolean
  toggleButtonTooltip?: string
  onActivateChange?: ActivateNetworkSwitchButtonProps['onChange']
  onTunnelProfileChange?: (data: Network, tunnelProfileId: string) => void
  isUpdating?: boolean
  pinNetworkIds?: string[]
}

export const ActivatedNetworksTable = (props: ActivatedNetworksTableProps) => {
  const {
    venueId,
    columnsSetting,
    activated,
    disabled,
    toggleButtonTooltip,
    onActivateChange,
    onTunnelProfileChange,
    isUpdating,
    pinNetworkIds
  } = props

  const { $t } = useIntl()
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const { form } = useStepFormContext<EdgeMvSdLanFormModel>()
  const {
    availableTunnelProfiles = [],
    associatedEdgeClusters = [],
    requiredFwMap = {}
  } = useEdgeSdLanContext()

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

  const dcTunnelProfileId = form.getFieldValue('tunnelProfileId')
  const allActivatedNetworks = form.getFieldValue('activatedNetworks') as EdgeSdLanFormType['activatedNetworks'] ?? []
  const allActivatedTunnelProfileIds = Object.values(allActivatedNetworks).flatMap(item => item.map(item => item.tunnelProfileId ?? ''))
  const currentNetworkList = activated?.[venueId]

  const tunnelProfileOptions = useMemo(() => {
    const selectedCluster = associatedEdgeClusters.find(
      cluster => cluster.clusterId === dcTunnelProfileId
    )

    const isSupportL2Gre = selectedCluster?.edgeList?.every(
      edge => compareVersions(edge.firmwareVersion, requiredFwMap[IncompatibilityFeatures.L2OGRE]) > -1
    )

    const filteredTunnelOptions = availableTunnelProfiles.filter(profile =>
      (isSupportL2Gre || profile.tunnelType !== TunnelTypeEnum.L2GRE) &&
      profile.id !== dcTunnelProfileId)

    const usedTunnelProfileIds = [
      ...(currentNetworkList?.map(item => item.tunnelProfileId ?? '') ?? []),
      ...(allActivatedTunnelProfileIds ?? [])
    ]

    return [
      {
        label: $t({ defaultMessage: 'Core Port' }),
        value: ''
      },
      ...transToOptions(filteredTunnelOptions, usedTunnelProfileIds)
    ]
  }, [availableTunnelProfiles, activated])

  const dsaeOnboardNetworkIds = (tableQuery.data?.data
    .map(item => item.dsaeOnboardNetwork?.id)
    .filter(i => !isNil(i)) ?? []) as string[]

  const defaultColumns: TableProps<Network>['columns'] = useMemo(() => ([{
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
      const disabledInfo = getRowDisabledInfo(row, dsaeOnboardNetworkIds, pinNetworkIds)
      let isDisabled = disabled
      let tooltip = toggleButtonTooltip

      return <ActivateNetworkSwitchButton
        row={row}
        activated={currentNetworkList?.map(item => item.networkId) ?? []}
        disabled={(isDisabled as boolean) || disabledInfo.disabled}
        tooltip={tooltip || disabledInfo.tooltip}
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
      const currentTunnelProfileId = currentNetworkList?.find(item => item.networkId === row.id)?.tunnelProfileId
      const processedOptions = getFilteredTunnelProfileOptions(row, tunnelProfileOptions, availableTunnelProfiles)
      return isEnabledTunneling && <Row align='middle' gutter={10}>
        <Col span={22}>
          <Select
            style={{ width: '100%' }}
            value={currentTunnelProfileId ?? ''}
            onChange={(value) => onTunnelProfileChange?.(row, value)}
            options={processedOptions}
          />
        </Col>
        <Col span={2}>
          <Form.Item
            noStyle
            name={['validation', index]}
            rules={[{ required: true }]}
            children={<input hidden />}
          />
          <Form.Item
            dependencies={['validation', index]}
            noStyle
          >
            {({ getFieldError }) => {
              const errors = getFieldError(['validation', index])
              return errors.length ?
                <Tooltip
                  title={errors[0]}
                  placement='bottom'
                  overlayInnerStyle={{ width: 415 }}><WarningCircleRed />
                </Tooltip> : undefined
            }}
          </Form.Item>
        </Col>
      </Row>
    }
  }
  ]), [
    venueId,
    activated,
    onActivateChange,
    disabled,
    dsaeOnboardNetworkIds,
    pinNetworkIds
  ])

  const actions: TableProps<Network>['actions'] = [{
    scopeKey: [WifiScopes.CREATE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)],
    label: $t({ defaultMessage: 'Add Wi-Fi Network' }),
    onClick: () => {
      setNetworkModalVisible(true)
    }
  }]

  const networkFormDefaultVals = useMemo(() => (venueId ? { defaultActiveVenues: [venueId] } : undefined),
    [venueId])

  return (
    <>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isUpdating }
      ]}>
        <Table
          rowKey='id'
          columns={defaultColumns.map(item => merge(item,
            find(columnsSetting, { key: item.key })))}
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

export const getFilteredTunnelProfileOptions = (
  row: Network,
  tunnelProfileOptions: DefaultOptionType[],
  availableTunnelProfiles: TunnelProfileViewData[]
) => {
  const { $t } = getIntl()
  const isVlanPooling = !isNil(row.vlanPool)
  const isCaptivePortal = row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL

  return tunnelProfileOptions
    .map(item => {
      const profile = availableTunnelProfiles.find(profile => profile.id === item.value)

      // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
      if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
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

      return item
    })
    .filter((item): item is DefaultOptionType => item !== null)
}
