import { Form }                   from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps } from '@acx-ui/components'
import { useGetEdgePortsStatusListQuery }       from '@acx-ui/rc/services'
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
  name: string
  serialNumber: string
}

const defaultPortStatusPayload = {
  fields: [
    'id',
    'serialNumber',
    'ip',
    'subnet'
  ]
}

export const ClusterInterface = (props: ClusterInterfaceProps) => {
  const { edgeNodeList } = props
  const params = useParams()
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const { data: PortData, isLoading: isPortDataLoading } = useGetEdgePortsStatusListQuery({
    params,
    payload: {
      ...defaultPortStatusPayload,
      filters: {
        serialNumber: edgeNodeList?.map(item => item.serialNumber),
        type: [EdgePortTypeEnum.CLUSTER]
      }
    }
  },{
    skip: !Boolean(edgeNodeList) || edgeNodeList?.length === 0
  })

  const handleFinish = async () => {}

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const columns: TableProps<ClusterInterfaceTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Node Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      key: 'destSubnet',
      dataIndex: 'destSubnet'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'nextHop',
      dataIndex: 'nextHop'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'nextHop',
      dataIndex: 'nextHop'
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
    <Loader states={[{ isLoading: isPortDataLoading }]}>
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
            dataSource={edgeNodeList}
            rowActions={filterByAccess(rowActions)}
            rowSelection={hasAccess() && { type: 'radio' }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}