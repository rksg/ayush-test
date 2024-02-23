import { useEffect, useState } from 'react'

import { Form }        from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps } from '@acx-ui/components'
import { useGetAllInterfacesByTypeQuery }       from '@acx-ui/rc/services'
import { EdgePortTypeEnum }                     from '@acx-ui/rc/utils'
import { useTenantLink }                        from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }            from '@acx-ui/user'

import * as CommUI from '../styledComponents'

interface ClusterInterfaceProps {
  edgeNodeList?: {
    serialNumber: string,
    name: string
  }[]
}

type ClusterInterfaceTableType = {
  nodeName: string
  serialNumber: string
  clusterInterfaceName?: string
  clusterInterfaceId?: string
  ip?: string
  subnet?: string
}

export const ClusterInterface = (props: ClusterInterfaceProps) => {
  const { edgeNodeList } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [tableData, setTableData] = useState<ClusterInterfaceTableType[]>()
  const {
    data: clusterInterfaceData,
    isLoading: isclusterInterfaceDataLoading
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: edgeNodeList?.map(item => item.serialNumber),
      portTypes: [EdgePortTypeEnum.CLUSTER]
    }
  },{
    skip: !Boolean(edgeNodeList) || edgeNodeList?.length === 0
  })

  useEffect(() => {
    if(!edgeNodeList || (isclusterInterfaceDataLoading && !clusterInterfaceData)) return
    if(tableData) return
    setTableData(edgeNodeList.map(item => {
      const currentPortData = clusterInterfaceData?.[item.serialNumber]?.[0]
      return {
        nodeName: item.name,
        serialNumber: item.serialNumber,
        clusterInterfaceName: _.capitalize(currentPortData?.portName),
        ip: currentPortData?.ip,
        subnet: currentPortData?.subnet
      }
    }))
  }, [edgeNodeList, clusterInterfaceData, tableData])

  const handleFinish = async () => {}

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const columns: TableProps<ClusterInterfaceTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Node Name' }),
      key: 'nodeName',
      dataIndex: 'nodeName'
    },
    {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      key: 'clusterInterfaceName',
      dataIndex: 'clusterInterfaceName'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
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
        // openDrawer(selectedRows[0])
      }
    }
  ]

  return (
    <Loader states={[{ isLoading: isclusterInterfaceDataLoading }]}>
      <CommUI.Mt15>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Please select the node interfaces and assign virtual IPs for seamless failover :' })
        }
      </CommUI.Mt15>
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      >
        <StepsForm.StepForm>
          <Table
            rowKey='serialNumber'
            columns={columns}
            dataSource={tableData}
            rowActions={filterByAccess(rowActions)}
            rowSelection={hasAccess() && { type: 'radio' }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}