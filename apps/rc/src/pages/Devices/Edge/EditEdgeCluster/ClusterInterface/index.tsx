import { useEffect, useRef, useState } from 'react'

import { Form }        from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps } from '@acx-ui/components'
import { useClusterInterfaceActions }           from '@acx-ui/rc/components'
import {
  EdgeClusterStatus,
  EdgePortInfo,
  EdgePortTypeEnum,
  validateClusterInterface,
  validateSubnetIsConsistent
} from '@acx-ui/rc/utils'
import { useTenantLink }             from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

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
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const clusterData = Form.useWatch('clusterData', form) as ClusterInterfaceTableType[]
  const {
    allInterfaceData,
    isInterfaceDataLoading,
    updateClusterInterface
  } = useClusterInterfaceActions(currentClusterStatus)

  useEffect(() => {
    if(!edgeNodeList || (isInterfaceDataLoading && !allInterfaceData)) return
    if(clusterData) return
    form.setFieldValue('clusterData', edgeNodeList.map(item => {
      const currentcClusterInterface = getTargetInterfaceConfig(item.serialNumber)
      return {
        nodeName: item.name,
        serialNumber: item.serialNumber,
        interfaceName: currentcClusterInterface?.portName,
        ipMode: currentcClusterInterface?.ipMode,
        ip: currentcClusterInterface?.ip,
        subnet: currentcClusterInterface?.subnet
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
