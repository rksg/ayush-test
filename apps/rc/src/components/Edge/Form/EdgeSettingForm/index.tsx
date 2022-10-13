import { useEffect, useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'
import { useIntl }                      from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

// will remove when api is ready
interface Option {
  label: string
  value: string
}

const EdgeSettingForm = () => {

  const { $t } = useIntl()
  const [venues, setVenues] = useState<Option[]>([])
  const [edgeGroups, setEdgeGroups] = useState<Option[]>([])

  useEffect(() => {
    // should call api here
    setVenues([{ label: 'Mock Venue 1', value: 'mock_venue_1' }
      , { label: 'Mock Venue 2', value: 'mock_venue_2' }
      , { label: 'Mock Venue 3', value: 'mock_venue_3' }])
    setEdgeGroups([{ label: 'Mock Group 1', value: 'mock_group_1' }
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
        <Select>
          {
            venues.map(venue =>
              <Select.Option key={venue.value} value={venue.value}> {
                venue.label}
              </Select.Option>)
          }
        </Select>
      </Form.Item>
      <Form.Item
        name='edgeGroupId'
        label={$t({ defaultMessage: 'SmartEdge Group' })}
      >
        <Select>
          {
            edgeGroups.map(edgeGroup =>
              <Select.Option key={edgeGroup.value} value={edgeGroup.value}>
                {edgeGroup.label}
              </Select.Option>)
          }
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