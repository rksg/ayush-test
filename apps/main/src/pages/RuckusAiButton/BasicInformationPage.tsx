import { Col, Form, Input } from 'antd'
import { useIntl }          from 'react-intl'


import { useVenuesListQuery }                         from '@acx-ui/rc/services'
import { checkObjectNotExists, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'
import { useParams }                                  from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

function BasicInformationPage () {
  const { $t } = useIntl()
  const params = useParams()

  const { data: venuesList } = useVenuesListQuery({
    params, payload: {
      fields: ['name', 'ssid'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const nameValidator = async (value: string) => {
    const list = venuesList?.data.map((n: { name: string }) => n.name) || []
    return checkObjectNotExists(list,
      value, $t({ defaultMessage: '<VenueSingular></VenueSingular>' }))
  }

  return (
    <div style={{
      marginLeft: '85px',
      height: '100%',
      maxHeight: 'calc(100vh - 320px)',
      minHeight: '200px'
    }}>
      <UI.PageTitle>
        {$t({ defaultMessage: '<VenueSingular></VenueSingular> Details' })}
      </UI.PageTitle>
      <Col span={8}>
        <Form.Item
          name='venueName'
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular> Name' })}
          validateTrigger={'onBlur'}
          rules={[
            {
              type: 'string', required: true,
              message: $t({
                defaultMessage:
                  'Please enter a <VenueSingular></VenueSingular> Name.'
              })
            },
            { min: 2, transform: (value) => value.trim() },
            { max: 32, transform: (value) => value.trim() },
            { validator: (_, value) => whitespaceOnlyRegExp(value) },
            {
              validator: (_, value) => nameValidator(value)
            }
          ]}
          hasFeedback
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='numberOfAp'
          label={$t({ defaultMessage: 'Approx. Number of APs' })}
          rules={[
            {
              validator: (_, value) => {
                const numericRegex = /^[0-9]+$/
                if (value?.length > 0 && !numericRegex.test(value)) {
                  return Promise.reject($t({ defaultMessage: 'Please enter a valid number.' }))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name='numberOfSwitch'
          label={$t({ defaultMessage: 'Approx. Number of Switches' })}
          rules={[
            {
              validator: (_, value) => {
                const numericRegex = /^[0-9]+$/
                if (value?.length > 0 && !numericRegex.test(value)) {
                  return Promise.reject($t({ defaultMessage: 'Please enter a valid number.' }))
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <Input/>
        </Form.Item>
      </Col>
      <Col span={16}>
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Tell me more about the deployment' })}
        >
          <Input.TextArea
            rows={8}
            placeholder={$t({ // eslint-disable-next-line max-len
              defaultMessage: 'For instance, the network deployment is planned to support around 2,000 people and will likely include separate networks for staff, registered clients, and visitors.'
            })}
          />
        </Form.Item>
      </Col>
    </div>
  )
}

export default BasicInformationPage
