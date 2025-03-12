
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useGetDhcpStatsQuery } from '@acx-ui/rc/services'

import { AddEdgeDhcpServiceModal } from '../AddEdgeDhcpServiceModal'

import { DhcpDetailDrawer } from './DhcpDetailDrawer'

interface EdgeDhcpSelectionFormProps {
  hasPin?: boolean
}

export const EdgeDhcpSelectionForm = (props: EdgeDhcpSelectionFormProps) => {

  const { hasPin } = props
  const { $t } = useIntl()

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

  const content = <Form.Item
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
      >
        <Select
          style={{ width: '200px' }}
          placeholder={$t({ defaultMessage: 'Select...' })}
          options={edgeDhcpOptions || []}
          loading={isEdgeDhcpOptionsLoading}
          disabled={hasPin}
        />
      </Form.Item>
      <Form.Item
        dependencies={['dhcpId']}
        noStyle
      >
        {
          ({ getFieldValue }) => {
            return <DhcpDetailDrawer dhcpId={getFieldValue('dhcpId')} />
          }
        }
      </Form.Item>
      <AddEdgeDhcpServiceModal />
    </Space>
  </Form.Item>

  return content
}

export default EdgeDhcpSelectionForm