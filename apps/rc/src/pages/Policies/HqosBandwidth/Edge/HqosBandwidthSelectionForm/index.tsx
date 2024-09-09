
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useStepFormContext }                     from '@acx-ui/components'
import { useGetEdgeHqosProfileViewDataListQuery } from '@acx-ui/rc/services'

import { AddHqosBandwidthModal }     from './AddHqosBandwidthModal'
import { HqosBandwidthDeatilDrawer } from './HqosBandwidthDetailDrawer'


export const EdgeQosProfileSelectionForm = () => {

  const { $t } = useIntl()
  const { form } = useStepFormContext()
  Form.useWatch('qosId', form)

  const {
    edgeQosOptions, isEdgeQosOptionsLoading
  } = useGetEdgeHqosProfileViewDataListQuery({
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
      <HqosBandwidthDeatilDrawer />
      <AddHqosBandwidthModal />
    </Space>
  </Form.Item>

  return content
}

export default EdgeQosProfileSelectionForm
