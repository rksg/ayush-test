import { useContext, useState, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  TableProps,
  Loader,
  Drawer,
  Table,
  Tooltip,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { VlanSettingDrawer }      from '@acx-ui/rc/components'
import {
  useGetVlanListBySwitchLevelQuery,
  useGetLagListQuery,
  useSwitchPortlistQuery,
  useAddSwitchesVlansMutation,
  useDeleteSwitchVlanMutation,
  useUpdateSwitchVlanMutation
}                            from '@acx-ui/rc/services'
import {
  Vlan,
  VenueMessages,
  transformTitleCase,
  useTableQuery,
  isStrictOperationalSwitch,
  transformDisplayOnOff,
  SpanningTreeProtocolName,
  SwitchMessages,
  SwitchStatusEnum,
  SwitchSlot,
  SwitchModel,
  SWITCH_DEFAULT_VLAN_NAME,
  SwitchPortViewModelQueryFields,
  SwitchPortViewModel
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'


import { SwitchDetailsContext } from '../..'

import { VlanDetail } from './vlanDetail'

export function SwitchOverviewVLANs () {
  const { $t } = useIntl()
  const { tenantId, switchId, serialNumber } = useParams()

  const [currentRow, setCurrentRow] = useState({} as Vlan)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [vlanDrawerVisible, setVlanDrawerVisible] = useState(false)

  const [editVlan, setEditVlan] = useState({} as unknown as Vlan)
  const [editMode, setEditMode] = useState(false)
  const [vlanList, setVlanList] = useState([] as Vlan[])
  const [cliApplied, setCliApplied] = useState(false)
  const [isSwitchOperational, setIsSwitchOperational] = useState(false)
  const [switchFamilyModel, setSwitchFamilyModel] = useState('')
  const [portSlotsData, setPortSlotsData] = useState([])

  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData

  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)

  const [addSwitchesVlans] = useAddSwitchesVlansMutation()
  const [updateSwitchVlan] = useUpdateSwitchVlanMutation()
  const [deleteSwitchVlan] = useDeleteSwitchVlanMutation()

  useEffect(() => {
    setSwitchFamilyModel(switchDetail?.model || '')
  }, [ switchDetail ])

  const tableQuery = useTableQuery({
    useQuery: useGetVlanListBySwitchLevelQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'vlanId',
      sortOrder: 'ASC'
    }
  })

  const { data: lagList, isLoading: isLagListLoading }
    = useGetLagListQuery({ params: { tenantId, switchId } })

  const { data: portsData } = useSwitchPortlistQuery({
    params: { tenantId, switchId },
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

  useEffect(() => {
    if (portsData?.data) {
      const portViewData = getPortViewData(portsData?.data)
      setPortSlotsData(portViewData.slots)
    }
  }, [ portsData ])


  const onClose = () => {
    setDrawerVisible(false)
  }

  const setVlan = async (values: Vlan) => {
    const payload = {
      ...(_.omit(values, ['switchFamilyModels'])),
      vlanId: Number(values.vlanId),
      switchId: switchId,
      ...( values?.switchFamilyModels?.length
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
          params: { tenantId, switchId, vlanId: editVlan?.id },
          payload
        }).unwrap()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    } else {
      try {
        await addSwitchesVlans({
          params: { tenantId, switchId },
          payload: [payload]
        }).unwrap()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
  }

  const columns: TableProps<Vlan>['columns'] = [
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN #' }),
      dataIndex: 'vlanId',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
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
      onClick: (selectedRows) => {
        setEditMode(true)
        setEditVlan({
          ...selectedRows[0],
          switchFamilyModels: selectedRows[0]?.switchVlanPortModels?.map(switchFamily => {
            return {
              ...switchFamily,
              model: switchFamily?.switchModel
            }
          }) as SwitchModel[]
        })
        setVlanDrawerVisible(true)
      }
    },
    {
      visible: (selectedRows) => selectedRows?.[0]?.vlanName !== SWITCH_DEFAULT_VLAN_NAME,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        const vlanId = rows[0]?.vlanId?.toString()
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: rows.length === 1
              ? $t({ defaultMessage: 'VLAN' })
              : $t({ defaultMessage: 'VLANs' }),
            entityValue: rows.length === 1
              ? $t({ defaultMessage: 'VLAN {vlan}' }, { vlan: vlanId })
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteSwitchVlan({ params: { vlanId: rows[0]?.id } })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = [{
    label: $t({ defaultMessage: 'Add VLAN' }),
    disabled: cliApplied || !isSwitchOperational,
    tooltip: cliApplied ? $t(VenueMessages.CLI_APPLIED) : '',
    onClick: () => {
      setEditMode(false)
      setEditVlan({} as Vlan)
      setVlanDrawerVisible(true)
    }
  }]

  useEffect(() => {
    if (tableQuery.data?.data && !isLagListLoading) {
      const portsUsedByLag = lagList?.map(l => l.ports).flat()

      setVlanList(tableQuery.data?.data.map(vlan => {
        const hasPortsUsedByLag = vlan?.switchVlanPortModels?.filter(port =>
          _.intersection(port.taggedPortsList, portsUsedByLag)?.length > 1
            || _.intersection(port.untaggedPortsList, portsUsedByLag)?.length > 1
        )

        return {
          ...vlan,
          inactiveRow: !!hasPortsUsedByLag?.length
        }
      }))
    }
  }, [tableQuery.data?.data, isLagListLoading])

  useEffect(() => {
    if (switchDetailsContextData) {
      const switchDetailHeader = switchDetailsContextData?.switchDetailHeader
      const isOperational = isStrictOperationalSwitch(
        switchDetailHeader?.deviceStatus as SwitchStatusEnum, !!switchDetailHeader?.configReady
        , !!switchDetailHeader?.syncedSwitchConfig)

      setCliApplied(switchDetailsContextData?.switchDetailHeader?.cliApplied || false)
      setIsSwitchOperational(isOperational || false)
    }
  }, [switchDetailsContextData])

  return (
    <Loader
      states={[tableQuery]}
    >
      <Table<Vlan>
        columns={columns}
        type='tall'
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={vlanList}
        rowKey='vlanId'
        rowActions={filterByAccess(rowActions)}
        rowSelection={
          hasAccess() && isSwitchLevelVlanEnabled && !cliApplied && isSwitchOperational && {
            type: 'radio',
            getCheckboxProps: (record) => ({
              disabled: record?.inactiveRow
            }),
            renderCell: (checked, record, index, originNode) => {
              return record?.inactiveRow
                ? <Tooltip title={
                  $t(SwitchMessages.LAG_MEMBER_PORT_NOT_SUPPORT_CONFIGURED)}
                >{originNode}</Tooltip>
                : originNode
            }
          }}
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
        setVlan={setVlan}
        vlansList={tableQuery.data?.data as Vlan[]}
      />}

    </Loader>
  )
}

function getPortViewData (portsData: SwitchPortViewModel[] ) {
  const portStatusData = {
    slots: [] as SwitchSlot[]
  }
  const tmpSlots: { [key:string]:SwitchSlot } = {}

  portsData
    .forEach(item => {
      const port = { ...item }
      const portNumber = port.portIdentifier.split('/')[2]
      port.portnumber = portNumber
      port.portNumber = portNumber
      port.usedInUplink = port.cloudPort
      const slot = Number(port.portIdentifier.split('/')[1])

      if(tmpSlots[slot]){
        tmpSlots[slot].portStatus.push(port)
        tmpSlots[slot].portCount++
        tmpSlots[slot].portNumber = Number(portNumber)
        tmpSlots[slot].portTagged = ''
      }else {
        tmpSlots[slot] = {
          portStatus: [port],
          portCount: 1,
          portNumber: Number(portNumber),
          portTagged: ''
        }
      }
    })
  Object.keys(tmpSlots).forEach(key => {
    portStatusData.slots.push(tmpSlots[key])
  })

  const tmpPortView = JSON.parse(JSON.stringify(portStatusData))
  tmpPortView.slots.forEach((slot:SwitchSlot) => {
    if (slot.portStatus !== undefined) {
      slot.slotNumber = Number(slot.portStatus[0].portIdentifier.split('/')[1])
    }
  })
  return tmpPortView
}
