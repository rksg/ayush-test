import { useEffect, useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import TextArea                         from 'antd/lib/input/TextArea'
import { useIntl }                      from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useVenuesListQuery }         from '@acx-ui/rc/services'
import { Venue }                      from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'

// will remove when api is ready
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
  const [venues, setVenues] = useState<Venue[]>([])
  const [edgeGroups, setEdgeGroups] = useState<Option[]>([])
  const params = useParams()
  const { data: venueData } = useVenuesListQuery({ params:
    { tenantId: params.tenantId }, payload: defaultPayload })

  useEffect(() => {
    setVenues(venueData?.data || [])
  }, [venueData])

  useEffect(() => {
    // TODO should call api to get edge group
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
              <Select.Option key={venue.id} value={venue.id}>
                {venue.name}
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