import { useContext, useEffect } from 'react'

import { Form, Input, Col, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }               from '@acx-ui/components'
import { MdnsProxyForwardingRule } from '@acx-ui/rc/utils'

import MdnsProxyFormContext              from './MdnsProxyFormContext'
import { MdnsProxyForwardingRulesTable } from './MdnsProxyForwardingRulesTable'



export function MdnsProxySettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const forwardingRules = Form.useWatch('forwardingRules')
  const { currentData } = useContext(MdnsProxyFormContext)

  useEffect(() => {
    form.resetFields()
    form.setFieldsValue(currentData)
  }, [currentData, form])

  const nameValidator = async (value: string) => {
    // const payload = { ...networkListPayload, searchString: value }
    // const list = (await getNetworkList({ params, payload }, true).unwrap()).data
    //   .filter(n => n.id !== params.networkId)
    //   .map(n => n.name)

    // return checkObjectNotExists(intl, list, value, intl.$t({ defaultMessage: 'Network' }))

    return Promise.resolve(value)
  }

  const handleSetForwardingRules = (rules: MdnsProxyForwardingRule[]) => {
    form.setFieldValue('forwardingRules', rules)
  }

  return (
    <Row>
      <Col span={8}>
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
          <MdnsProxyForwardingRulesTable
            readonly={false}
            rules={forwardingRules}
            setRules={handleSetForwardingRules}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}
