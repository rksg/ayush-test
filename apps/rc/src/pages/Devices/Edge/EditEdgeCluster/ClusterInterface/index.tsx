import { useEffect, useRef, useState } from 'react'

import { Form }        from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps } from '@acx-ui/components'
import { useClusterInterfaceActions }           from '@acx-ui/rc/components'
import {
  EdgeCluster,
  EdgeClusterStatus,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgeUrlsInfo,
  VirtualIpSetting,
  filterByAccessForServicePolicyMutation,
  getEdgePortIpFromStatusIp,
  validateClusterInterface,
  validateSubnetIsConsistent
} from '@acx-ui/rc/utils'
import { useTenantLink }                           from '@acx-ui/react-router-dom'
import { EdgeScopes }                              from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'
import { getOpsApi }                               from '@acx-ui/utils'

import * as CommUI from '../styledComponents'

import { EditClusterInterfaceDrawer } from './EditClusterInterfaceDrawer'

interface ClusterInterfaceProps {
  currentClusterStatus?: EdgeClusterStatus
  currentVipConfig?: EdgeCluster['virtualIpSettings']
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
  const { currentClusterStatus, currentVipConfig } = props
  const edgeNodeList = currentClusterStatus?.edgeList
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const {
    allInterfaceData,
    isInterfaceDataLoading,
    isInterfaceDataFetching,
    updateClusterInterface
  } = useClusterInterfaceActions(currentClusterStatus)

  useEffect(() => {
    if(!edgeNodeList || (isInterfaceDataLoading && !allInterfaceData)) return
    form.setFieldValue('clusterData', edgeNodeList.map(item => {
      const currentClusterInterface = getTargetInterfaceConfig(item.serialNumber)
      return {
        nodeName: item.name,
        serialNumber: item.serialNumber,
        interfaceName: currentClusterInterface?.portName,
        ipMode: currentClusterInterface?.ipMode,
        ip: getEdgePortIpFromStatusIp(currentClusterInterface?.ip),
        subnet: currentClusterInterface?.subnet
      }
    }))
  }, [edgeNodeList, allInterfaceData, isInterfaceDataLoading])

  const getTargetInterfaceConfig = (serialNumber: string) => {
    return allInterfaceData?.[serialNumber]?.find(
      interfaceData => interfaceData.portType === EdgePortTypeEnum.CLUSTER &&
      interfaceData.portEnabled
    )
  }

  const getAllNodesSubnetInfo = (value?: ClusterInterfaceTableType[]) => {
    return value?.map(item => ({
      ip: item.ip,
      subnet: item.subnet
    })) ?? []
  }

  const handleFinish = async (data: ClusterInterfaceFormType) => {
    await updateClusterInterface(data.clusterData)
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasUpdatePermission =!!hasCrossVenuesPermission({ needGlobalPermission: true })
  && hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeClusterNetworkSettings)]
  })

  return (
    <Loader states={[{ isLoading: isInterfaceDataLoading, isFetching: isInterfaceDataFetching }]}>
      <CommUI.Mt15>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Cluster interface will be used as a communication channel between RUCKUS Edges. Please select the cluster interfaces for all RUCKUS Edges in this cluster:' })
        }
      </CommUI.Mt15>
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
      >
        <StepsForm.StepForm>
          <Form.Item
            name='clusterData'
            rules={
              [
                { required: true },
                {
                  validator: (_, value: ClusterInterfaceTableType[]) =>
                    validateClusterInterface((value?.map(item => item.interfaceName ?? '') ?? []))
                },
                {
                  validator: (_, value) =>
                    validateSubnetIsConsistent(getAllNodesSubnetInfo(value), 'true'),
                  message: $t({ defaultMessage: `Make sure that 
                  each node is within the same subnet range.` })
                }
              ]
            }
            children={
              <ClusterInterfaceTable
                allInterfaceData={allInterfaceData}
                vipConfig={currentVipConfig?.virtualIps}
              />
            }
            validateFirst
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}

type ClusterInterfaceTableProps = {
  value?: ClusterInterfaceTableType[]
  onChange?: (data: unknown) => void
  allInterfaceData?: {
    [key: string]: EdgePortInfo[];
  }
  vipConfig?: VirtualIpSetting[]
}

const ClusterInterfaceTable = (props: ClusterInterfaceTableProps) => {
  const { value, onChange, allInterfaceData, vipConfig } = props
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
      render: (_data, row) => _.capitalize(row.interfaceName)
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      render: (_data, row) => row.ip
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
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <Table
        rowKey='serialNumber'
        columns={columns}
        dataSource={value}
        rowActions={allowedRowActions}
        rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
      />
      <EditClusterInterfaceDrawer
        visible={editDrawerVisible}
        setVisible={setEditDrawerVisible}
        handleFinish={handleEditDrawerFinish}
        interfaceList={allInterfaceData?.[currentEditData?.serialNumber ?? '']}
        editData={currentEditData}
        allNodeData={value}
        vipConfig={vipConfig}
      />
    </>
  )
}
