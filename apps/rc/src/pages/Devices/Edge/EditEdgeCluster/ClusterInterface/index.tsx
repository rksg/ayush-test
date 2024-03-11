import { useEffect, useRef, useState } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps, showActionModal } from '@acx-ui/components'
import {
  useGetAllInterfacesByTypeQuery,
  useLazyGetEdgeLagListQuery,
  useLazyGetPortConfigQuery,
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeIpModeEnum,
  EdgeLag,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgePortWithStatus
} from '@acx-ui/rc/utils'
import { useTenantLink }             from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import * as CommUI from '../styledComponents'

import { EditClusterInterfaceDrawer } from './EditClusterInterfaceDrawer'

interface ClusterInterfaceProps {
  currentClusterStatus?: EdgeClusterStatus
}

export interface ClusterInterfaceTableType {
  nodeName: string
  serialNumber: string
  interfaceName?: string
  ip?: string
  subnet?: string
}

interface ClusterInterfaceFormType {
  clusterData: ClusterInterfaceTableType[]
}

export const ClusterInterface = (props: ClusterInterfaceProps) => {
  const { currentClusterStatus } = props
  const edgeNodeList = currentClusterStatus?.edgeList
  const { clusterId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const clusterData = Form.useWatch('clusterData', form) as ClusterInterfaceTableType[]
  const [getPortConfig] = useLazyGetPortConfigQuery()
  const [getEdgeLagList] = useLazyGetEdgeLagListQuery()
  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const {
    data: allInterfaceData,
    isLoading: isInterfaceDataLoading
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: edgeNodeList?.map(item => item.serialNumber),
      portType: [EdgePortTypeEnum.CLUSTER, EdgePortTypeEnum.LAN, EdgePortTypeEnum.UNCONFIGURED]
    }
  },{
    skip: !Boolean(edgeNodeList) || edgeNodeList?.length === 0
  })

  useEffect(() => {
    if(!edgeNodeList || (isInterfaceDataLoading && !allInterfaceData)) return
    if(clusterData) return
    form.setFieldValue('clusterData', edgeNodeList.map(item => {
      const currentcClusterInterface = getOldInterfaceConfig(item.serialNumber)
      return {
        nodeName: item.name,
        serialNumber: item.serialNumber,
        interfaceName: currentcClusterInterface?.portName,
        ip: currentcClusterInterface?.ip,
        subnet: currentcClusterInterface?.subnet
      }
    }))
  }, [edgeNodeList, allInterfaceData, isInterfaceDataLoading])

  const organizeToLagSetting = async (
    newInterfaceData: ClusterInterfaceTableType,
    payload: ClusterNetworkSettings,
    oldInterfaceData?: EdgePortInfo
  ) => {
    const lagData = await getEdgeLagList({
      params: { serialNumber: newInterfaceData.serialNumber },
      payload: { page: 1, pageSize: 20 }
    })
    let lags = lagData.data?.data
    lags = lags?.map(item => {
      const lagName = `lag${item.id}`
      let portType = item.portType
      let ipMode = item.ipMode
      let ip = item.ip
      let subnet = item.subnet
      let lagEnabled = item.lagEnabled
      if(lagName === newInterfaceData.interfaceName?.toLocaleLowerCase()) {
        portType = EdgePortTypeEnum.CLUSTER
        ip = newInterfaceData.ip ?? ''
        subnet = newInterfaceData.subnet ?? ''
        ipMode = EdgeIpModeEnum.STATIC
        lagEnabled = true
      } else if(lagName === oldInterfaceData?.portName.toLocaleLowerCase()) {
        lagEnabled = false
      }
      return {
        ...item,
        portType,
        ipMode,
        ip,
        subnet,
        lagEnabled
      }
    }) as EdgeLag[]
    return [
      ...(payload.lagSettings ?? []),
      {
        serialNumber: newInterfaceData.serialNumber,
        lags
      }
    ]
  }

  const organizeToPortSetting = async (
    newInterfaceData: ClusterInterfaceTableType,
    payload: ClusterNetworkSettings,
    oldInterfaceData?: EdgePortInfo
  ) => {
    const portData = await getPortConfig({
      params: { serialNumber: newInterfaceData.serialNumber }
    })
    let ports: EdgePortWithStatus[] = portData.data?.ports as EdgePortWithStatus[]
    ports = ports?.map(item =>{
      let portType = item.portType
      let ipMode = item.ipMode
      let ip = item.ip
      let subnet = item.subnet
      let enabled = item.enabled
      if(item.interfaceName === newInterfaceData.interfaceName) {
        portType = EdgePortTypeEnum.CLUSTER
        ip = newInterfaceData.ip ?? ''
        subnet = newInterfaceData.subnet ?? ''
        ipMode = EdgeIpModeEnum.STATIC
        enabled = true
      } else if(item.interfaceName === oldInterfaceData?.portName) {
        enabled = false
      }

      return {
        ...item,
        portType,
        ipMode,
        ip,
        subnet,
        enabled
      }
    })
    return [
      ...(payload.portSettings ?? []),
      {
        serialNumber: newInterfaceData.serialNumber,
        ports
      }
    ]
  }

  const getOldInterfaceConfig = (serialNumber: string) => {
    return allInterfaceData?.[serialNumber]?.find(
      interfaceData => interfaceData.portType === EdgePortTypeEnum.CLUSTER &&
      interfaceData.portEnabled
    )
  }

  const isDataChanged = (data: ClusterInterfaceFormType) => {
    for(let interfaceData of data.clusterData) {
      const oldInterfaceData = getOldInterfaceConfig(interfaceData.serialNumber)
      if(oldInterfaceData?.portName !== interfaceData.interfaceName) {
        return true
      }
    }
    return false
  }

  const excuteUpdate = async (data: ClusterInterfaceFormType) => {
    const payload = {} as ClusterNetworkSettings
    for(let interfaceData of data.clusterData) {
      const oldInterfaceData = getOldInterfaceConfig(interfaceData.serialNumber)
      if(oldInterfaceData?.portName.charAt(0) !== interfaceData.interfaceName?.charAt(0)) {
        if(oldInterfaceData?.portName.toLocaleLowerCase()?.includes('lag')) {
          payload.lagSettings = await organizeToLagSetting(interfaceData, payload, oldInterfaceData)
        } else {
          payload.portSettings = await organizeToPortSetting(
            interfaceData,
            payload,
            oldInterfaceData
          )
        }
      }
      if(interfaceData.interfaceName?.toLocaleLowerCase()?.includes('lag')) {
        payload.lagSettings = await organizeToLagSetting(interfaceData, payload, oldInterfaceData)
      } else {
        payload.portSettings = await organizeToPortSetting(
          interfaceData,
          payload,
          oldInterfaceData
        )
      }
    }
    try {
      await updateNetworkConfig({
        params: {
          venueId: currentClusterStatus?.venueId,
          clusterId
        },
        payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFinish = async (data: ClusterInterfaceFormType) => {
    if(isDataChanged(data)) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Change Cluster Interface' }),
        content: $t({
          defaultMessage: `Are you sure you want to change the cluster interface to 
          different port/LAG? The currently used port/LAG as the cluster interface 
          will be disabled.`
        }),
        okText: $t({ defaultMessage: 'Change' }),
        onOk: async () => {
          await excuteUpdate(data)
        }
      })
    } else {
      await excuteUpdate(data)
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  return (
    <Loader states={[{ isLoading: isInterfaceDataLoading }]}>
      <CommUI.Mt15>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Cluster interface will be used as a communication channel between SmartEdges. Please select the cluster interfaces for all SmartEdges in this cluster:' })
        }
      </CommUI.Mt15>
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      >
        <StepsForm.StepForm>
          <Form.Item
            name='clusterData'
            rules={
              [
                { required: true },
                { validator: (_, value) => validateClusterInterface(value) }
              ]
            }
            children={
              <ClusterInterfaceTable
                allInterfaceData={allInterfaceData}
              />
            }
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}

const validateClusterInterface = (value: ClusterInterfaceTableType[]) => {
  if((value?.length ?? 0) <= 1) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<value.length; i++){
    for(let j=i+1; j<value.length; j++) {
      if (value[i].interfaceName?.charAt(0) !== value[j].interfaceName?.charAt(0)) {
        return Promise.reject(
          $t({ defaultMessage: `Make sure you select the same interface type
          (physical port or LAG) as that of another node in this cluster.` })
        )
      }
    }
  }
  return Promise.resolve()
}

type ClusterInterfaceTableProps = {
  value?: ClusterInterfaceTableType[]
  onChange?: (data: unknown) => void
  allInterfaceData?: {
    [key: string]: EdgePortInfo[];
  }
}

const ClusterInterfaceTable = (props: ClusterInterfaceTableProps) => {
  const { value, onChange, allInterfaceData } = props
  const { $t } = useIntl()
  const valueMap = useRef<Record<string, unknown>>({})
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<ClusterInterfaceTableType>()

  useEffect(()=> {
    valueMap.current = value ? _.keyBy(value, 'serialNumber') : {}
  }, [value])

  const handleEditDrawerFinish = (data: ClusterInterfaceTableType) => {
    valueMap.current[data.serialNumber] = data
    onChange?.(Object.values(valueMap.current))
  }

  const columns: TableProps<ClusterInterfaceTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Node Name' }),
      key: 'nodeName',
      dataIndex: 'nodeName'
    },
    {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      key: 'interfaceName',
      dataIndex: 'interfaceName',
      render: (data, row) => _.capitalize(row.interfaceName)
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      render: (data, row) => row.ip?.split('/')[0]
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet'
    }
  ]

  const rowActions: TableProps<ClusterInterfaceTableType>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setCurrentEditData(selectedRows[0])
        setEditDrawerVisible(true)
      }
    }
  ]

  return (
    <>
      <Table
        rowKey='serialNumber'
        columns={columns}
        dataSource={value}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'radio' }}
      />
      <EditClusterInterfaceDrawer
        visible={editDrawerVisible}
        setVisible={setEditDrawerVisible}
        handleFinish={handleEditDrawerFinish}
        interfaceList={allInterfaceData?.[currentEditData?.serialNumber ?? '']}
        editData={currentEditData}
        allNodeData={value}
      />
    </>
  )
}