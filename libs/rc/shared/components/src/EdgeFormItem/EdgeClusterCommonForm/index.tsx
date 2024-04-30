import { Form, Input } from 'antd'
import TextArea        from 'antd/lib/input/TextArea'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { Select }             from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'

const venueOptionsDefaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

export interface EdgeClusterCommonFormData {
  venueId: string
  name: string
  description?: string
}

export const EdgeClusterCommonForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const disabledFields = form.getFieldValue('disabledFields')
  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })

  return(
    <>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: 'Venue' })}
        rules={[{
          required: true
        }]}
      >
        <Select
          options={venueOptions}
          disabled={disabledFields?.includes('venue')}
          loading={isVenuesListLoading}
        />
      </Form.Item>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Cluster Name' })}
        rules={[
          { required: true },
          { max: 64 }
        ]}
        children={<Input />}
        validateFirst
      />
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        children={<TextArea rows={4} maxLength={255} />}
      />
    </>
  )
}