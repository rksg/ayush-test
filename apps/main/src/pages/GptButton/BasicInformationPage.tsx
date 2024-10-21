import { Col, Form, Input } from 'antd'
import { number }           from 'echarts'
import { isNumber }         from 'lodash'
import { useIntl }          from 'react-intl'


import * as UI from './styledComponents'

function BasicInformationPage () {
  const { $t } = useIntl()

  return (
    <div style={{ marginLeft: '85px' }}>
      <UI.PageTitle>
        {$t({ defaultMessage: '<VenueSingular></VenueSingular> Details' })}
      </UI.PageTitle>
      <Col span={8}>
        <Form.Item
          name='venueName'
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular> Name' })}
          rules={[{ required: true }]}
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
              defaultMessage: 'For example, the network is to be deployed in an elementary school with about 2,000 students. We will probably need a network for staff, one for students, and perhaps one for visitors. This description can be as long or as short as you like. But the more you tell me, the better would be my recommendations.'
            })}
          />
        </Form.Item>
      </Col>
    </div>
  )
}

export default BasicInformationPage
