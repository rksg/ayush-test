
import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { useGetEdgeMdnsProxyViewDataListQuery }    from '@acx-ui/rc/services'
import { EdgeScopes }                              from '@acx-ui/types'
import { hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

import { MdnsAddModal }     from './MdnsAddModal'
import { MdnsDetailDrawer } from './MdnsDetailDrawer'


export const EdgeMdnsProfileSelectionForm = () => {
  const { $t } = useIntl()

  const {
    edgeMdnsOptions, isEdgeMdnsOptionsLoading
  } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        edgeMdnsOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isEdgeMdnsOptionsLoading: isLoading
      }
    }
  })

  const hasUpdatePermission =!!hasCrossVenuesPermission({ needGlobalPermission: true })
  && hasPermission({ scopes: [EdgeScopes.CREATE] })

  return <Form.Item
    label={$t({ defaultMessage: 'mDNS Proxy Service' })}
  >
    <Space>
      <Form.Item
        name='edgeMdnsId'
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please select a mDNS Proxy service' })
          }
        ]}
        noStyle
      >
        <Select
          style={{ width: '200px' }}
          options={edgeMdnsOptions || []}
          placeholder={$t({ defaultMessage: 'Select...' })}
          loading={isEdgeMdnsOptionsLoading}
        />
      </Form.Item>
      <Form.Item
        dependencies={['edgeMdnsId']}
        noStyle
      >
        {
          ({ getFieldValue }) => {
            return <MdnsDetailDrawer serviceId={getFieldValue('edgeMdnsId')} />
          }
        }
      </Form.Item>
      {hasUpdatePermission && <MdnsAddModal />}
    </Space>
  </Form.Item>
}

export default EdgeMdnsProfileSelectionForm