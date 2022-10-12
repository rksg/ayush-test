import { Form, Input, Select, Tooltip } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'
import { useIntl }                      from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

const EdgeSettingForm = () => {

  const { $t } = useIntl()

  return (
    <>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: 'Venue' })}
        rules={[{
          required: true
        }]}
      >
        <Select>
          <Select.Option value='mock_venue_1'> Mock Venue 1 </Select.Option>
          <Select.Option value='mock_venue_2'> Mock Venue 2 </Select.Option>
          <Select.Option value='mock_venue_3'> Mock Venue 3 </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name='edgeGroupId'
        label={$t({ defaultMessage: 'SmartEdge Group' })}
      >
        <Select>
          <Select.Option value='mock_group_1'> Mock Group 1 </Select.Option>
          <Select.Option value='mock_group_2'> Mock Group 2 </Select.Option>
          <Select.Option value='mock_group_3'> Mock Group 3 </Select.Option>
        </Select>
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