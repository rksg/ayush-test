import { useContext, useEffect } from 'react'

import { Form, Input, Col, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsForm }                                     from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable }                 from '@acx-ui/rc/components'
import { useLazyGetMdnsProxyListQuery }                  from '@acx-ui/rc/services'
import { checkObjectNotExists, MdnsProxyForwardingRule } from '@acx-ui/rc/utils'

import MdnsProxyFormContext from './MdnsProxyFormContext'



export function MdnsProxySettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const forwardingRules = Form.useWatch('forwardingRules')
  const { currentData } = useContext(MdnsProxyFormContext)
  const params = useParams()
  const id = Form.useWatch<string>('id', form)
  const [ mdnsProxyList ] = useLazyGetMdnsProxyListQuery()

  useEffect(() => {
    form.resetFields()
    form.setFieldsValue(currentData)
  }, [currentData, form])

  const nameValidator = async (value: string) => {
    const list = (await mdnsProxyList({ params }).unwrap())
      .filter(mdnsProxy => mdnsProxy.id !== id)
      .map(mdnsProxy => ({ serviceName: mdnsProxy.serviceName }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { serviceName: value } , $t({ defaultMessage: 'mDNS Proxy service' }))
  }

  const handleSetForwardingRules = (rules: MdnsProxyForwardingRule[]) => {
    form.setFieldValue('forwardingRules', rules)
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item name='id' noStyle>
          <Input type='hidden' />
        </Form.Item>
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
