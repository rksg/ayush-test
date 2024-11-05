import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import {
  EdgeMdnsProxyViewData,
  MdnsProxyFeatureTypeEnum,
  MdnsProxyForwardingRule,
  servicePolicyNameRegExp,
  transformDisplayNumber
} from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRulesTable, RULES_MAX_COUNT } from '../../../services/MdnsProxyForwardingRulesTable'
import { SpaceWrapper }                                   from '../../../SpaceWrapper'

import { StyledText, StyledSubText } from './styledComponents'

export const SettingsForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeMdnsProxyViewData>()

  const handleSetRules = (rules: MdnsProxyForwardingRule[]) => {
    form.setFieldValue('forwardingRules', rules.map((rule, idx) => ({
      ...rule,
      ruleIndex: idx
    })))
  }

  return (
    <SpaceWrapper full direction='vertical' size={30} justifycontent='flex-start'>
      <Row>
        <Col span={12}>
          <StepsForm.Title>
            {$t({ defaultMessage: 'Settings' })}
          </StepsForm.Title>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2, max: 32 },
              { validator: (_, value) => servicePolicyNameRegExp(value) }
            ]}
            validateFirst
            children={<Input />}
          />
        </Col>
      </Row>

      <Row>
        <Col span={18}>
          <Form.Item
            label={<Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                return <StyledText>
                  {$t({ defaultMessage: 'Forwarding Rules ({rulesCount})' },
                    // eslint-disable-next-line max-len
                    { rulesCount: transformDisplayNumber(getFieldValue('forwardingRules')?.length) })}
                </StyledText>
              }}</Form.Item>}
          >
            <StyledSubText>
              {$t({ defaultMessage: 'Up to {maxCount} rules may be added' },
                { maxCount: RULES_MAX_COUNT })}
            </StyledSubText>
            <Form.Item
              name='forwardingRules'
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Please set forwarding rules' })
              }]}
              valuePropName='rules'
              noStyle
            >
              <MdnsProxyForwardingRulesTable
                featureType={MdnsProxyFeatureTypeEnum.EDGE}
                readonly={false}
                setRules={handleSetRules}
              />
            </Form.Item>
          </Form.Item>
        </Col>
      </Row>
    </SpaceWrapper>
  )
}