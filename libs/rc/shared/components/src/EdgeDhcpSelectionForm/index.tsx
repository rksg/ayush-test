
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { Loader, Table, TableProps, useStepFormContext }    from '@acx-ui/components'
import { useGetDhcpStatsQuery, useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import { EdgeDhcpPool }                                     from '@acx-ui/rc/utils'

import { AddEdgeDhcpServiceModal } from '../AddEdgeDhcpServiceModal'

interface EdgeDhcpSelectionFormProps {
  hasNsg?: boolean
}

export const EdgeDhcpSelectionForm = (props: EdgeDhcpSelectionFormProps) => {

  const { hasNsg } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const dhcpId = Form.useWatch('dhcpId', form)

  const {
    edgeDhcpOptions, isEdgeDhcpOptionsLoading
  } = useGetDhcpStatsQuery({
    payload: {
      fields: ['id', 'serviceName'],
      pageSize: 10000,
      sortField: 'serviceName',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        edgeDhcpOptions: data?.data.map(item => ({ label: item.serviceName, value: item.id })),
        isEdgeDhcpOptionsLoading: isLoading
      }
    }
  })

  const { currentDhcp, isCurrentDhcpFetching } = useGetEdgeDhcpServiceQuery(
    { params: { id: dhcpId } },
    {
      skip: !Boolean(dhcpId),
      selectFromResult: ({ data, isFetching }) => ({
        currentDhcp: data,
        isCurrentDhcpFetching: isFetching
      })
    }
  )

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
      render (_, item) {
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
    <Form.Item
      label={$t({ defaultMessage: 'DHCP Service' })}
      data-testid='edge-cluster-dhcp-select-form-label'>
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
            loading={isEdgeDhcpOptionsLoading}
            disabled={hasNsg}
          />
        </Form.Item>
        <AddEdgeDhcpServiceModal />
      </Space>
    </Form.Item>
    {
      dhcpId &&
      <Loader states={[
        { isFetching: isCurrentDhcpFetching, isLoading: false }
      ]}>
        <Table
          rowKey='id'
          type='form'
          columns={columns}
          dataSource={currentDhcp?.dhcpPools}
        />
      </Loader>
    }
  </>

  return content
}

export default EdgeDhcpSelectionForm