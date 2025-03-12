
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useGetEdgeHqosProfileViewDataListQuery }  from '@acx-ui/rc/services'
import { EdgeScopes }                              from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

import { AddHqosBandwidthModal }     from './AddHqosBandwidthModal'
import { HqosBandwidthDetailDrawer } from './HqosBandwidthDetailDrawer'


export const EdgeHqosProfileSelectionForm = () => {

  const { $t } = useIntl()

  const {
    edgeHqosOptions, isEdgeHqosOptionsLoading
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
        edgeHqosOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isEdgeHqosOptionsLoading: isLoading
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
        name='hqosId'
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
          placeholder={$t({ defaultMessage: 'Select...' })}
          options={edgeHqosOptions || []}
          loading={isEdgeHqosOptionsLoading}
        />
      </Form.Item>
      <Form.Item
        dependencies={['hqosId']}
        noStyle
      >
        {
          ({ getFieldValue }) => {
            return <HqosBandwidthDetailDrawer hqosId={getFieldValue('hqosId')} />
          }
        }
      </Form.Item>
      {hasUpdatePermission && <AddHqosBandwidthModal />}
    </Space>
  </Form.Item>

  return content
}
