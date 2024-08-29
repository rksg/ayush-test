
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useStepFormContext }                    from '@acx-ui/components'
import { useGetEdgeQosProfileViewDataListQuery } from '@acx-ui/rc/services'

import { AddQosBandwidthModal }     from './AddQosBandwidthModal'
import { QosBandwidthDeatilDrawer } from './QosBandwidthDetailDrawer'


export const EdgeQosProfileSelectionForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext()
  Form.useWatch('qosId', form)

  const {
    edgeQosOptions, isEdgeQosOptionsLoading
  } = useGetEdgeQosProfileViewDataListQuery({
    payload: {
      fields: ['id', 'name'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        edgeQosOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isEdgeQosOptionsLoading: isLoading
      }
    }
  })


  const content = <Form.Item
    label={$t({ defaultMessage: 'QoS Bandwitdth Profile' })}
    data-testid='edge-cluster-qos-select-form-label'>
    <Space>
      <Form.Item
        name='qosId'
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please select a QoS Profile' })
          }
        ]}
        noStyle
      >
        <Select
          style={{ width: '200px' }}
          options={[
            { label: $t({ defaultMessage: 'Select...' }), value: null },
            ...(edgeQosOptions || [])
          ]}
          loading={isEdgeQosOptionsLoading}
        />
      </Form.Item>
      <QosBandwidthDeatilDrawer />
      <AddQosBandwidthModal />
    </Space>
  </Form.Item>

  return content
}

export default EdgeQosProfileSelectionForm