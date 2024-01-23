
import { useEffect } from 'react'

import { Form, Select, Space } from 'antd'
import { useForm, useWatch }   from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Loader, Table, TableProps }                                from '@acx-ui/components'
import { AddEdgeDhcpServiceModal }                                  from '@acx-ui/rc/components'
import { useGetEdgeDhcpListQuery, usePatchEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpPool, EdgeDhcpSetting }                            from '@acx-ui/rc/utils'

interface EdgeDhcpSelectionFormProps {
  inUseService: string | null
  hasNsg?: boolean
}

export const EdgeDhcpSelectionForm = (props: EdgeDhcpSelectionFormProps) => {

  const { hasNsg } = props
  const { $t } = useIntl()
  const [form] = useForm()
  const dhcpId = useWatch('dhcpId', form)
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
  const [patchEdgeDhcpService] = usePatchEdgeDhcpServiceMutation()

  useEffect(() => {
    form.setFieldValue('dhcpId', props.inUseService)
  }, [props.inUseService])

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

  const handleFinish = async () => {
    const pathParams = { id: dhcpId }
    const payload = { edgeIds: [...edgeDhcpData[dhcpId].edgeIds, params.serialNumber] }
    await patchEdgeDhcpService({ params: pathParams, payload }).unwrap()
  }

  const content = <>
    <Form
      form={form}
      onFinish={handleFinish}
      layout='vertical'
    >
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
            />
          </Form.Item>
          <AddEdgeDhcpServiceModal />
        </Space>
      </Form.Item>
    </Form>
    <Loader states={[
      { isFetching: isEdgeDhcpDataFetching, isLoading: false }
    ]}>
      <Table
        rowKey='id'
        type='form'
        columns={columns}
        dataSource={edgeDhcpData && edgeDhcpData[dhcpId]?.dhcpPools}
      />
    </Loader>
  </>

  return (
    <>
    {content}
    </>
  )
}

export default EdgeDhcpSelectionForm