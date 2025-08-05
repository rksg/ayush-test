import { Row, Col, Form, Tooltip, Input } from 'antd'
import { useIntl }                        from 'react-intl'

import { useIsSplitOn, Features }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  domainNameRegExp, domainNameWithIPv6RegExp,
  Ipsec,
  useConfigTemplate } from '@acx-ui/rc/utils'

import { AuthenticationFormItem } from './AuthenticationFormItem'
import { messageMapping }         from './messageMapping'
import { MoreSettings }           from './MoreSettings'
import { SecurityAssociation }    from './SecurityAssociation'

interface SoftGreSettingFormProps {
  policyId?: string
  editData?: Ipsec
}
export const SoftGreSettingForm = (props: SoftGreSettingFormProps) => {
  const { $t } = useIntl()
  const isApIpModeFFEnabled = useIsSplitOn(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)
  const { isTemplate } = useConfigTemplate()

  const { editData } = props

  const securityGatewayValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      return domainNameWithIPv6RegExp(value)
    }
    return domainNameRegExp(value)
  }

  return <><Row>
    <Col span={12}>
      <Form.Item
        name='serverAddress'
        label={<>
          {$t({ defaultMessage: 'Security Gateway IP/FQDN' })}
          <Tooltip title={$t(messageMapping.security_gateway_tooltip)} placement='bottom'>
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        rules={[
          { validator: (_, value) => securityGatewayValidator(value),
            message: $t({ defaultMessage: 'Please enter a valid IP address or FQDN' })
          }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <AuthenticationFormItem />
    </Col>
  </Row>
  <Row>
    <Col span={24}>
      <SecurityAssociation editData={editData} />
      <MoreSettings editData={editData} />
    </Col>
  </Row>
  </>
}