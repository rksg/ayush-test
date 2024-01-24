
import { useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Loader, Table, TableProps, useStepFormContext }                                from '@acx-ui/components'
import { AddEdgeDhcpServiceModal }                                  from '@acx-ui/rc/components'
import { useGetEdgeDhcpListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpPool, EdgeDhcpSetting }                            from '@acx-ui/rc/utils'
import { FormInstance } from 'antd/es/form/Form'
import useFormInstance from 'antd/lib/form/hooks/useFormInstance'

interface EdgeDhcpSelectionFormProps {
  //inUseService: string | null
  form: FormInstance
  hasNsg?: boolean
}

export const EdgeDhcpSelectionForm = (props: EdgeDhcpSelectionFormProps) => {

  const { hasNsg } = props
  const { $t } = useIntl()
  const form = useStepFormContext()
  console.log('form=' + form.form.getFieldsValue())

  //const [dhcpId, setDhcpId] = useState<string | null>(props.inUseService)
  const params = useParams()
  const {
    data: edgeDhcpData,
    edgeDhcpOptions,
    isLoading: isEdgeDhcpDataFetching
  } = useGetEdgeDhcpListQuery(
    { params, payload: { page: 1, pageSize: 10000 } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          data: data?.content.reduce((acc, item) => ({
            ...acc,
            [item.id]: item
          }), {}) as { [key: string]: EdgeDhcpSetting },
          edgeDhcpOptions: data?.content.map(item => ({ label: item.serviceName, value: item.id })),
          isLoading
        }
      }
    })

  // useEffect(() => {
  //   //console.log('in use service: ' + props.inUseService)
  //   //setDhcpId(props.inUseService)
  // }, [props.inUseService])

  const handleDhcpServiceChange = (value: string | null) => {
    //setDhcpId(value)
  }

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool Name' }),
      key: 'poolName',
      dataIndex: 'poolName'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'poolStartIp',
      dataIndex: 'poolStartIp',
      render (data, item) {
        return `${item.poolStartIp} - ${item.poolEndIp}`
      }
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gatewayIp',
      dataIndex: 'gatewayIp'
    }
  ]

  const content = <>
    <Form.Item label={$t({ defaultMessage: 'DHCP Service' })}>
      <Space>
        <Form.Item
          name='dhcpId'
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please select a DHCP Service' })
            }
          ]}
          noStyle
          initialValue={null}
        >
          <Select
            style={{ width: '200px' }}
            options={[
              { label: $t({ defaultMessage: 'Select...' }), value: null },
              ...(edgeDhcpOptions || [])
            ]}
            loading={isEdgeDhcpDataFetching}
            disabled={hasNsg}
            onChange={handleDhcpServiceChange}
          />
        </Form.Item>
        <AddEdgeDhcpServiceModal />
      </Space>
    </Form.Item>
    <Loader states={[
      { isFetching: isEdgeDhcpDataFetching, isLoading: false }
    ]}>
      {props.form.getFieldValue('dhcpId') &&
      <Table
        rowKey='id'
        type='form'
        columns={columns}
        dataSource={edgeDhcpData && edgeDhcpData[props.form.getFieldValue('dhcpId')]?.dhcpPools}
      />}
    </Loader>
  </>

  return content
}

export default EdgeDhcpSelectionForm