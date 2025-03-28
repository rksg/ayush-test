import { useState, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  TableProps,
  Loader,
  Drawer,
  Table,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { DefaultVlanDrawer, VlanSettingDrawer } from '@acx-ui/rc/components'
import {
  useGetVlanListBySwitchLevelQuery,
  useGetLagListQuery,
  useGetSwitchRoutedListQuery,
  useSwitchPortlistQuery,
  useStackMemberListQuery,
  useDeleteSwitchVlanMutation,
  useUpdateSwitchVlanMutation,
  useAddSwitchVlansMutation
}                            from '@acx-ui/rc/services'
import {
  Vlan,
  VenueMessages,
  transformTitleCase,
  useTableQuery,
  isStrictOperationalSwitch,
  transformDisplayOnOff,
  SpanningTreeProtocolName,
  SwitchStatusEnum,
  SwitchSlot,
  SwitchModel,
  SWITCH_DEFAULT_VLAN_NAME,
  SwitchPortViewModelQueryFields,
  SwitchPortViewModel,
  SwitchViewModel,
  VeViewModel,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { SwitchScopes }                  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getOpsApi }                     from '@acx-ui/utils'

import { VlanDetail } from './vlanDetail'

export function SwitchOverviewVLANs (props: {
  switchDetail?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const { switchDetail } = props
  const { tenantId, switchId, serialNumber } = useParams()

  const [currentRow, setCurrentRow] = useState({} as Vlan)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [vlanDrawerVisible, setVlanDrawerVisible] = useState(false)
  const [defaultVlanDrawerVisible, setDefaultVlanDrawerVisible] = useState(false)

  const [editVlan, setEditVlan] = useState({} as unknown as Vlan)
  const [editMode, setEditMode] = useState(false)
  const [vlanList, setVlanList] = useState([] as Vlan[])
  const [defaultVlan, setDefaultVlan] = useState({} as Vlan)
  const [vlanTableData, setVlanTableData] = useState([] as Vlan[])

  const [usedByLag, setUsedByLag] = useState({} as Record<string, string>)
  const [usedUntaggedPorts, setUsedUntaggedPorts] = useState({} as Record<string, string>)

  const [cliApplied, setCliApplied] = useState(false)
  const [isSwitchOperational, setIsSwitchOperational] = useState(false)
  const [switchFamilyModel, setSwitchFamilyModel] = useState('')
  const [switchFirmware, setSwitchFirmware] = useState('')
  const [portSlotsData, setPortSlotsData] = useState([] as SwitchSlot[][])
  const [isDefaultVlanAppliedACL, setIsDefaultVlanAppliedACL] = useState(false)

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)

  const [addSwitchesVlans] = useAddSwitchVlansMutation()
  const [updateSwitchVlan] = useUpdateSwitchVlanMutation()
  const [deleteSwitchVlan] = useDeleteSwitchVlanMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetVlanListBySwitchLevelQuery,
    enableRbac: isSwitchRbacEnabled,
    apiParams: { venueId: (switchDetail?.venueId || '') as string },
    defaultPayload: {},
    sorter: {
      sortField: 'vlanId',
      sortOrder: 'ASC'
    },
    option: {
      skip: !switchDetail?.venueId
    }
  })

  const { data: vlanListBySwitch, isLoading: isVlanListLoading }
  = useGetVlanListBySwitchLevelQuery({
    params: { tenantId, switchId, venueId: switchDetail?.venueId },
    enableRbac: isSwitchRbacEnabled,
    payload: {
      pageSize: 9999,
      sorter: {
        sortField: 'vlanId',
        sortOrder: 'ASC'
      }
    }
  }, {
    skip: !(switchDetail?.venueId && isSwitchLevelVlanEnabled)
  })

  const { data: lagList, isLoading: isLagListLoading }
    = useGetLagListQuery({
      params: { tenantId, switchId, venueId: switchDetail?.venueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !(switchDetail?.venueId && isSwitchLevelVlanEnabled)
    })

  const { data: vePortsList, isLoading: isVePortsListLoading }
    = useGetSwitchRoutedListQuery({
      params: { tenantId, switchId, venueId: switchDetail?.venueId },
      payload: {
        sortField: 'name',
        pageSize: 10000
      },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !(switchDetail?.venueId && isSwitchLevelVlanEnabled)
    })

  const { data: stackMember, isLoading: isStackMemberLoading } = useStackMemberListQuery({
    params: { tenantId, switchId, venueId: switchDetail?.venueId },
    payload: {
      fields: ['activeUnitId', 'unitId', 'unitStatus', 'name', 'deviceStatus', 'model',
        'serialNumber', 'activeSerial', 'switchMac', 'ip', 'venueName', 'uptime'],
      filters: { activeUnitId: [switchDetail?.serialNumber] } }
  }, {
    skip: !(switchDetail?.venueId && switchDetail?.enableStack && isSwitchLevelVlanEnabled)
  })

  const { data: portsData } = useSwitchPortlistQuery({
    params: { tenantId, switchId },
    enableRbac: isSwitchRbacEnabled,
    payload: {
      filters: { switchId: [serialNumber] },
      sortField: 'portIdentifierFormatted',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000,
      fields: SwitchPortViewModelQueryFields
    } }, {
    skip: !isSwitchLevelVlanEnabled
  })

  const onClose = () => {
    setDrawerVisible(false)
  }

  const applyVlan = async (values: Vlan) => {
    const portData = values?.switchFamilyModels?.[0]
    const hasPortData = portData
      && (portData?.taggedPorts?.length || portData?.untaggedPorts?.length)

    const payload = {
      ...(_.omit(values, ['switchFamilyModels'])),
      vlanId: Number(values.vlanId),
      switchId: switchId,
      ...( hasPortData
        ? { switchVlanPortModels: values?.switchFamilyModels?.map(switchFamily => {
          return {
            switchModel: switchFamilyModel,
            taggedPorts: switchFamily?.taggedPorts?.toString(),
            untaggedPorts: switchFamily?.untaggedPorts?.toString()
          }
        }) }
        : {}
      )
    }

    if (editMode) {
      try {
        await updateSwitchVlan({
          params: { tenantId, switchId, vlanId: editVlan?.id, venueId: switchDetail?.venueId },
          payload
        }).unwrap()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    } else {
      try {
        await addSwitchesVlans({
          params: { tenantId, switchId, venueId: switchDetail?.venueId },
          payload: payload
        }).unwrap()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
  }

  const applyDefaultVlan = async (values: Vlan) => {
    const payload = {
      ...values,
      vlanId: Number(values.vlanId),
      switchId: switchId,
      enableAsDefaultVlan: true
    }

    try {
      await updateSwitchVlan({
        params: { tenantId, switchId, venueId: switchDetail?.venueId, vlanId: defaultVlan.id },
        payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const columns: TableProps<Vlan>['columns'] = [
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN #' }),
      dataIndex: 'vlanId',
      defaultSortOrder: 'ascend',
      sorter: true,
      // fixed: 'left',
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentRow(row)
            setDrawerVisible(true)
          }}
        >
          {row.vlanId}
        </Button>
    }, {
      key: 'vlanName',
      title: $t({ defaultMessage: 'VLAN Name' }),
      sorter: true,
      dataIndex: 'vlanName'
    }, {
      key: 'ipv4DhcpSnooping',
      title: $t({ defaultMessage: 'IPv4 DHCP Snooping' }),
      dataIndex: 'ipv4DhcpSnooping',
      sorter: true,
      render: (_, { ipv4DhcpSnooping }) => transformDisplayOnOff(Boolean(ipv4DhcpSnooping))
    }, {
      key: 'arpInspection',
      title: $t({ defaultMessage: 'ARP Inspection' }),
      dataIndex: 'arpInspection',
      sorter: true,
      render: (_, { arpInspection }) => transformDisplayOnOff(Boolean(arpInspection))
    }, {
      key: 'igmpSnooping',
      title: $t({ defaultMessage: 'IGMP Snooping' }),
      dataIndex: 'igmpSnooping',
      sorter: true,
      render: (_, { igmpSnooping }) => transformTitleCase(igmpSnooping as string)
    }, {
      key: 'multicastVersion',
      title: $t({ defaultMessage: 'Multicast Version' }),
      sorter: true,
      dataIndex: 'multicastVersion'
    }, {
      key: 'spanningTreeProtocol',
      title: $t({ defaultMessage: 'Spanning Tree' }),
      dataIndex: 'spanningTreeProtocol',
      sorter: true,
      render: (_, { spanningTreeProtocol }) => {
        return spanningTreeProtocol ? SpanningTreeProtocolName[spanningTreeProtocol] : null
      }
    }, {
      key: 'untaggedPorts',
      title: $t({ defaultMessage: 'Untagged Ports' }),
      dataIndex: 'untaggedPorts'
    }, {
      key: 'taggedPorts',
      title: $t({ defaultMessage: 'Tagged Ports' }),
      dataIndex: 'taggedPorts'
    }

  ]

  const rowActions: TableProps<Vlan>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitchVlan)],
      onClick: (selectedRows) => {
        const selectedRow = selectedRows?.[0]
        const isSelectDefaultVlan = selectedRow?.vlanName === SWITCH_DEFAULT_VLAN_NAME
        if (isSelectDefaultVlan) {
          setDefaultVlanDrawerVisible(true)
        } else {
          setEditMode(true)
          setEditVlan({
            ...selectedRow,
            switchFamilyModels: selectedRow?.switchVlanPortModels?.map(switchFamily => {
              return {
                ...switchFamily,
                model: switchFamily?.switchModel
              }
            }) as SwitchModel[]
          })
          setVlanDrawerVisible(true)
        }
      }
    },
    {
      visible: (selectedRows) => selectedRows?.[0]?.isDeletable ?? true,
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteSwitchVlan)],
      onClick: (rows, clearSelection) => {
        const vlanId = rows[0]?.vlanId?.toString()
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'VLAN' }),
            entityValue: $t({ defaultMessage: 'VLAN {vlan}' }, { vlan: vlanId }),
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteSwitchVlan({ params: {
              venueId: switchDetail?.venueId,
              switchId: switchId,
              vlanId: rows[0]?.id
            } }).then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = [{
    label: $t({ defaultMessage: 'Add VLAN' }),
    disabled: cliApplied || !isSwitchOperational,
    tooltip: cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
    scopeKey: [SwitchScopes.CREATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitchVlans)],
    onClick: () => {
      setEditMode(false)
      setEditVlan({} as Vlan)
      setVlanDrawerVisible(true)
    }
  }, {
    label: $t({ defaultMessage: 'Default VLAN settings' }),
    disabled: cliApplied || !isSwitchOperational,
    tooltip: cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitchVlan)],
    onClick: () => {
      setDefaultVlanDrawerVisible(true)
    }
  }]

  const isSelectionVisible
    = hasPermission({
      scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE],
      rbacOpsIds: [
        getOpsApi(SwitchRbacUrlsInfo.deleteSwitchVlan),
        getOpsApi(SwitchRbacUrlsInfo.updateSwitchVlan)
      ] })
  && isSwitchLevelVlanEnabled && !cliApplied && isSwitchOperational

  const getUsedPorts = (vlanList: Vlan[], checkPostsField: 'untaggedPorts' | 'taggedPorts') => {
    return vlanList?.filter(
      v => v?.[checkPostsField] && v?.vlanName !== SWITCH_DEFAULT_VLAN_NAME
    ).reduce((result, v) => {
      const ports = v?.[checkPostsField]?.split(',')?.reduce((tmp, port) => ({
        ...tmp,
        [port]: v.vlanId
      }), {})
      return {
        ...result,
        ...ports
      }
    }, {})
  }

  useEffect(() => {
    if (portsData?.data) {
      const portViewData = getPortViewData(portsData?.data)
      setPortSlotsData(portViewData.slots)
    }
  }, [ portsData ])

  useEffect(() => {
    const isDataReady
      = tableQuery.data?.data && !isLagListLoading && !isVePortsListLoading
      && !isVlanListLoading && !isStackMemberLoading

    if (isDataReady) {
      const portsUsedByLagObj = lagList?.reduce((result, lag) => {
        const ports = lag.ports?.reduce((tmp, port) => ({
          ...tmp,
          [port]: lag.name
        }), {})
        return { ...result, ...ports }
      }, {})
      const portsUsedByLag = Object.keys(portsUsedByLagObj ?? {})

      const veList = vePortsList?.data as VeViewModel[]
      const vlansUsedByVe = veList?.filter(ve => ve.vlanId).map(ve => ve.vlanId)

      const vlanList = vlanListBySwitch?.data as Vlan[]
      const vlanTableData = tableQuery.data?.data.map(vlan => {
        const hasPortsUsedByLag = vlan?.switchVlanPortModels?.filter(port =>
          _.intersection(port.taggedPorts?.split(','), portsUsedByLag)?.length > 0
            || _.intersection(port.untaggedPorts?.split(','), portsUsedByLag)?.length > 0
        )?.length
        const hasVlansUsedByVe = vlansUsedByVe?.includes(vlan.vlanId)

        return {
          ...vlan,
          isDeletable: !hasVlansUsedByVe
            && !hasPortsUsedByLag
            && (vlan.vlanName !== SWITCH_DEFAULT_VLAN_NAME)
            && !vlan.isAuthDefaultVlan
        }
      })
      const defaultVlan = vlanList?.filter(
        v => v.vlanName === SWITCH_DEFAULT_VLAN_NAME)?.[0]

      const isDefaultVlanAppliedACL = veList
        ?.filter(ve => ve.vlanId === Number(defaultVlan?.vlanId)
        // eslint-disable-next-line max-len
          && (ve.ingressAclName || ve.egressAclName || ve.vsixIngressAclName || ve.vsixEgressAclName)
        )?.length > 0

      const usedUntagged = getUsedPorts(vlanList, 'untaggedPorts')

      setVlanList(vlanList)
      setUsedByLag(portsUsedByLagObj as Record<string, string>)
      setUsedUntaggedPorts(usedUntagged as Record<string, string>)
      setVlanTableData(vlanTableData as Vlan[])
      setIsDefaultVlanAppliedACL(isDefaultVlanAppliedACL)
      setDefaultVlan(defaultVlan)
    }
  }, [tableQuery.data?.data, vlanListBySwitch,
    isLagListLoading, isVePortsListLoading, isVlanListLoading, isStackMemberLoading
  ])

  useEffect(() => {
    if (switchDetail) {
      const isOperational = isStrictOperationalSwitch(
        switchDetail?.deviceStatus as SwitchStatusEnum, !!switchDetail?.configReady
        , !!switchDetail?.syncedSwitchConfig)

      setSwitchFamilyModel(switchDetail?.model || '')
      setSwitchFirmware(switchDetail?.firmware || '')
      setCliApplied(switchDetail?.cliApplied || false)
      setIsSwitchOperational(isOperational || false)
    }
  }, [switchDetail])

  return (
    <Loader
      states={[tableQuery]}
    >
      <Table<Vlan>
        columns={columns}
        type='tall'
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={vlanTableData}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={isSelectionVisible && { type: 'radio' }}
        actions={isSwitchLevelVlanEnabled ? filterByAccess(tableActions) : []}
      />

      <Drawer
        title={$t({ defaultMessage: 'View VLAN' })}
        visible={drawerVisible}
        onClose={onClose}
        children={
          <VlanDetail
            row={currentRow}
          />
        }
      />

      { isSwitchLevelVlanEnabled && vlanDrawerVisible && <VlanSettingDrawer
        editMode={editMode}
        visible={vlanDrawerVisible}
        setVisible={setVlanDrawerVisible}
        vlan={editVlan as Vlan}
        switchFamilyModel={switchFamilyModel}
        enablePortModelConfigure={true}
        portSlotsData={portSlotsData}
        setVlan={applyVlan}
        vlansList={vlanList}
        portsUsedBy={{
          lag: usedByLag,
          untagged: _.omit(usedUntaggedPorts, editVlan?.untaggedPorts?.split(',') ?? [])
        }}
        stackMember={stackMember?.data ?? undefined}
        switchFirmware={switchFirmware}
      />}

      { isSwitchLevelVlanEnabled && defaultVlanDrawerVisible && <DefaultVlanDrawer
        visible={defaultVlanDrawerVisible}
        setVisible={setDefaultVlanDrawerVisible}
        defaultVlan={defaultVlan}
        setDefaultVlan={applyDefaultVlan}
        isSwitchLevel={true}
        isAppliedACL={isDefaultVlanAppliedACL}
        vlansList={vlanList}
        switchFirmware={switchFirmware}
      />}

    </Loader>
  )
}

export function getPortViewData (
  portsData: SwitchPortViewModel[]): { slots: SwitchSlot[][]
} {
  const tmpSlots = portsData.reduce((acc, port) => {
    const [unit, slotStr, portNumberStr] = port.portIdentifier.split('/')
    const unitNumber = Number(unit)
    const slotNumber = Number(slotStr)
    const portNumber = Number(portNumberStr)

    const updatedPort = {
      ...port,
      portnumber: portNumberStr,
      portNumber: portNumberStr,
      usedInUplink: port.cloudPort
    }

    if (!acc[unitNumber]) {
      acc[unitNumber] = {}
    }

    if (!acc[unitNumber][slotNumber]) {
      acc[unitNumber][slotNumber] = { portStatus: [], portCount: 0, portNumber: 0, portTagged: '' }
    }

    acc[unitNumber][slotNumber].portStatus.push(updatedPort)
    acc[unitNumber][slotNumber].portCount++
    acc[unitNumber][slotNumber].portNumber = portNumber
    acc[unitNumber][slotNumber].slotNumber = slotNumber

    return acc

  }, {} as { [key: number]: { [key: number]:SwitchSlot } })

  return {
    slots: Object.values(tmpSlots).map(slot => Object.values(slot))
  }
}
