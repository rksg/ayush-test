import { useContext, useEffect } from 'react'

import { Form, Input, Col, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsFormLegacy }                                from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable, RULES_MAX_COUNT } from '@acx-ui/rc/components'
import { useLazyGetMdnsProxyListQuery }                   from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  MdnsProxyForwardingRule,
  servicePolicyNameRegExp
}  from '@acx-ui/rc/utils'

import MdnsProxyFormContext from './MdnsProxyFormContext'
import * as UI              from './styledComponents'

export function MdnsProxySettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const rules = Form.useWatch('rules')
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
      .map(mdnsProxy => ({ serviceName: mdnsProxy.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { serviceName: value } , $t({ defaultMessage: 'mDNS Proxy service' }))
  }

  const handleSetRules = (rules: MdnsProxyForwardingRule[]) => {
    form.setFieldValue('rules', rules)
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
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
            { validator: (_, value) => nameValidator(value) },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
          validateTrigger={'onBlur'}
        />
        <Form.Item
          name='rules'
          rules={[{
            required: true
          }]}
          label={
            $t({ defaultMessage: 'Forwarding Rules ({count})' }, { count: rules?.length ?? 0 })
          }
        >
          <UI.TableSubLabel>
            {$t({
              defaultMessage: 'Up to {maxCount} rules may be added'
            }, {
              maxCount: RULES_MAX_COUNT
            })}
          </UI.TableSubLabel>
          <MdnsProxyForwardingRulesTable
            readonly={false}
            rules={rules}
            setRules={handleSetRules}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}
