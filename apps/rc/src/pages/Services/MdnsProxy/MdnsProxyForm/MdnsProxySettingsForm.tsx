import { Form, Input, Col, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { MdnsProxyForwardingRulesTable } from './MdnsProxyForwardingRulesTable'


export function MdnsProxySettingsForm () {
  const { $t } = useIntl()

  const nameValidator = async (value: string) => {
    // const payload = { ...networkListPayload, searchString: value }
    // const list = (await getNetworkList({ params, payload }, true).unwrap()).data
    //   .filter(n => n.id !== params.networkId)
    //   .map(n => n.name)

    // return checkObjectNotExists(intl, list, value, intl.$t({ defaultMessage: 'Network' }))

    return Promise.resolve(value)
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />
        <Form.Item
          name='forwardingRules'
          label={$t({ defaultMessage: 'Forwarding Rules' })}
        >
          <MdnsProxyForwardingRulesTable />
        </Form.Item>
      </Col>
    </Row>
  )
}
