import { useEffect, useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'
import { useIntl }                      from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useVenuesListQuery }         from '@acx-ui/rc/services'
import { useParams }                  from '@acx-ui/react-router-dom'

// TODO will remove when api is ready
interface Option {
  label: string
  value: string
}

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

const EdgeSettingForm = () => {

  const { $t } = useIntl()
  const [edgeGroupOptions, setEdgeGroupOptions] = useState<Option[]>([])
  const params = useParams()
  const { venueOptions } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: defaultPayload }, {
    selectFromResult ({ data }) {
      return {
        venueOptions: data?.data.map(item =>
          <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)
      }
    }
  })

  useEffect(() => {
    // TODO will remove when api is ready
    setEdgeGroupOptions([{ label: 'Mock Group 1', value: 'mock_group_1' }
      , { label: 'Mock Group 2', value: 'mock_group_2' }
      , { label: 'Mock Group 3', value: 'mock_group_3' }])
  }, [])

  return (
    <>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: 'Venue' })}
        rules={[{
          required: true
        }]}
      >
        <Select children={venueOptions} />
      </Form.Item>
      <Form.Item
        name='edgeGroupId'
        label={$t({ defaultMessage: 'SmartEdge Group' })}
      >
        <Select options={edgeGroupOptions} />
      </Form.Item>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'SmartEdge Name' })}
        rules={[{
          required: true
        }]}
        children={<Input />}
      />
      <Form.Item
        name='serialNumber'
        label={<>
          { $t({ defaultMessage: 'Serial Number' }) }
          <Tooltip
            title={$t({ defaultMessage: 'test' })}
            placement='bottom'
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please enter Serial Number' })
        }]}
        children={<Input />}
      />
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        children={<TextArea rows={4} maxLength={64} />}
      />
      <Form.Item
        name='tags'
        label={$t({ defaultMessage: 'Tags' })}
        children={<Input />}
      />
    </>
  )
}

export default EdgeSettingForm