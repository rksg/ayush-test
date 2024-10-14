
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useStepFormContext }                      from '@acx-ui/components'
import { useGetEdgeHqosProfileViewDataListQuery }  from '@acx-ui/rc/services'
import { EdgeScopes }                              from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

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

  const hasUpdatePermission =!!hasCrossVenuesPermission({ needGlobalPermission: true })
  && hasPermission({ scopes: [EdgeScopes.CREATE] })


  const content = <Form.Item
    label={$t({ defaultMessage: 'HQoS Bandwitdth Profile' })}
    data-testid='edge-cluster-qos-select-form-label'>
    <Space>
      <Form.Item
        name='qosId'
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please select a HQoS Profile' })
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
      {hasUpdatePermission && <AddHqosBandwidthModal />}
    </Space>
  </Form.Item>

  return content
}

export default EdgeQosProfileSelectionForm
