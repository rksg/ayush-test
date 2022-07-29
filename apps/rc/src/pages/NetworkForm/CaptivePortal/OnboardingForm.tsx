import { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import {
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Tooltip
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useWatch }            from 'antd/lib/form/Form'

import { StepFormProps, StepsForm }                            from '@acx-ui/components'
import { CreateNetworkFormFields, NetworkTypeEnum, URLRegExp } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

const OnboardingMessages = {
  REDIRECT_TOOLTIP: 'If unchecked, users will reach the page they originally requested',
  GUEST_DHCP_DISABLE_TOOLTIP: 'You cannot enable the DHCP service because the network is activated in a Mesh enabled Venue.',
  GUEST_DHCP_TOOLTIP: 'Clients will recieve IP addresses in an isolated {guestDhcpIpSpec} network.'
}

export function OnboardingForm (props: StepFormProps<CreateNetworkFormFields>) {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <OptionsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL} />
      </Col>
    </Row>
  )

  function OptionsForm () {
    const [
      redirectCheckbox,
      redirectUrl
    ] = [
      useWatch('redirectCheckbox'),
      useWatch('redirectUrl')
    ]
    const [redirectUrlValue, setRedirectUrlValue] = useState('')
    const [meshEnable, setMeshEnable] = useState(false)
    const redirectCheckboxChange = (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        props.formRef?.current?.setFieldsValue({ redirectUrl: redirectUrlValue })
      } else {
        setRedirectUrlValue(redirectUrl)
        props.formRef?.current?.setFieldsValue({ redirectUrl: '' })
      }
    }
  
    return (
      <>
        <StepsForm.Title>Onboarding</StepsForm.Title>
        <Form.Item>
          <Form.Item
            noStyle
            name='redirectCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox onChange={redirectCheckboxChange} />}
          />
          <span>Redirect users to</span>
          <Tooltip title={OnboardingMessages.REDIRECT_TOOLTIP} placement='bottom'>
            <QuestionCircleOutlined />
          </Tooltip>
          <Form.Item
            name='redirectUrl'
            rules={[{
              validator: (_, value) => URLRegExp(value)
            }]}
            children={
              <Input
                style={{ marginTop: '5px' }} 
                placeholder='e.g. http://www.example.com' 
                disabled={!redirectCheckbox}
              />
            }
          />
        </Form.Item>
        <Form.Item>
          <Form.Item
            noStyle
            name='dhcpCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={<Checkbox />}
          />
          <span>Enable Ruckus DHCP service</span>
          <Tooltip title={meshEnable ? 
            OnboardingMessages.GUEST_DHCP_DISABLE_TOOLTIP :
            OnboardingMessages.GUEST_DHCP_TOOLTIP
          } 
          placement='bottom'
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>
      </>
    )
  }
}


