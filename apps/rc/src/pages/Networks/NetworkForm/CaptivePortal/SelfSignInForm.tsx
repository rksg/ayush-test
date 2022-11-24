
import { useState } from 'react'

import {
  Checkbox,
  InputNumber,
  Col,
  Form,
  Row,
  Select,
  Space,
  Tooltip,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }           from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import {
  GuestNetworkTypeEnum, NetworkTypeEnum, URLRegExp } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import * as UI            from '../styledComponents'

import { DhcpCheckbox }     from './DhcpCheckbox'
import FacebookSetting      from './FacebookSetting'
import GoogleSetting        from './GoogleSetting'
import LinkedInSetting      from './LinkedInSetting'
import { RedirectUrlInput } from './RedirectUrlInput'
import TwitterSetting       from './TwitterSetting'


export function SelfSignInForm () {
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const [
    allowedDomainsCheckbox,
    socialDomains,
    enableSmsLogin,
    facebook,
    google,
    twitter,
    linkedIn
  ] = [
    useWatch('allowedDomainsCheckbox'),
    useWatch('socialDomains'),
    useWatch('enableSmsLogin'),
    useWatch(['socialIdentities','facebook']),
    useWatch(['socialIdentities','google']),
    useWatch(['socialIdentities','twitter']),
    useWatch(['socialIdentities','linkedIn'])
  ]
  const [allowedDomainsValue, setAllowedDomainsValue] = useState('')
  const [allowedSignValue, setAllowedSignValue] = useState([] as Array<string>)
  const { $t } = useIntl()
  const { Option }=Select
  const domainToolTip='Only clients registering with email addresses '+
    'from these domains will be allowed to connect to the network. '+
    'Not applicable for SMS registration (if enabled)'
  const isSocial = facebook||google||twitter||linkedIn
  const collectEmail=$t({
    defaultMessage:
      'Collect email addresses of users who connect to this network'
  })
  const updateAllowSign=(checked:boolean, name:Array<string>)=>{
    form.setFieldValue(name, checked)
    const allowedSignValueTemp = [...allowedSignValue]
    if(checked){
      allowedSignValueTemp.push(name[1]||name[0])
    }else{
      allowedSignValueTemp.map((val, i)=>{
        if(val===(name[1]||name[0])){
          return allowedSignValueTemp.splice(i,1)
        }
        return true
      })
    }
    if(allowedSignValueTemp.length<1){
      form.setFieldValue('allowedDomainsCheckbox', false)
      form.setFieldValue('socialEmails', false)
      form.setFieldValue('socialDomains', '')
    }
    form.setFieldValue('allowSign', allowedSignValueTemp)
    setAllowedSignValue(allowedSignValueTemp)
  }
  return (
    <Row gutter={20}>
      <Col span={12}>
        <StepsForm.Title>{$t({ defaultMessage: 'Onboarding' })}</StepsForm.Title>
        <Form.Item
          name='allowSign'
          rules={[
            { validator: (_, value) => {
              if (value.length<1) {
                return Promise.reject($t({ defaultMessage: 'Please configure sign-in option' }))
              }
              if(facebook&&!form.getFieldValue(['socialIdentities','facebook','config','appId']))
              {
                return Promise.reject($t({ defaultMessage: 'Please configure facebook' }))
              }
              if(google&&!form.getFieldValue(['socialIdentities','google','config','appId']))
              {
                return Promise.reject($t({ defaultMessage: 'Please configure google' }))
              }
              if(twitter&&!form.getFieldValue(['socialIdentities','twitter','config','appId']))
              {
                return Promise.reject($t({ defaultMessage: 'Please configure twitter' }))
              }
              if(linkedIn&&!form.getFieldValue(['socialIdentities','linkedIn','config','appId']))
              {
                return Promise.reject($t({ defaultMessage: 'Please configure linkedIn' }))
              }
              return Promise.resolve()
            } }
          ]}
          label={<>
            {$t({ defaultMessage: 'Allow Sign-In Using:(At least one option must be selected)' })}
          </>}
        >
          <Form.Item name='enableSmsLogin'>
            <UI.Checkbox onChange={(e)=>updateAllowSign(e.target.checked,['enableSmsLogin'])}>
              <UI.SMSToken/>
              {$t({ defaultMessage: 'SMS Token' })}
            </UI.Checkbox>
            <Tooltip title={$t({ defaultMessage: 'Self-service signup using one '+
                'time token sent to a mobile number' })}
            placement='bottom'>
              <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
            </Tooltip>
          </Form.Item>
          <Form.Item name={['socialIdentities','facebook']}>
            <UI.Checkbox onChange={(e)=>updateAllowSign(e.target.checked,
              ['socialIdentities','facebook'])}>
              <UI.Facebook/>
              {$t({ defaultMessage: 'Facebook' })}
            </UI.Checkbox>
            <Tooltip title={$t({ defaultMessage: 'Edit Facebook app' })}
              placement='bottom'>
              {facebook&&<FacebookSetting/>}
            </Tooltip>
          </Form.Item>
          <Form.Item name={['socialIdentities','google']}>
            <UI.Checkbox onChange={(e)=>updateAllowSign(e.target.checked,
              ['socialIdentities','google'])}>
              <UI.Google/>
              {$t({ defaultMessage: 'Google' })}
            </UI.Checkbox>
            <Tooltip title={$t({ defaultMessage: 'Edit Google app' })}
              placement='bottom'>
              {google&&<GoogleSetting/>}
            </Tooltip>
          </Form.Item>
          <Form.Item name={['socialIdentities','twitter']}>
            <UI.Checkbox onChange={(e)=>updateAllowSign(e.target.checked,
              ['socialIdentities','twitter'])}>
              <UI.Twitter/>
              {$t({ defaultMessage: 'Twitter' })}
            </UI.Checkbox>
            <Tooltip title={$t({ defaultMessage: 'Edit Twitter app' })}
              placement='bottom'>
              {twitter&&<TwitterSetting/>}
            </Tooltip>
          </Form.Item>
          <Form.Item name={['socialIdentities','linkedIn']}>
            <UI.Checkbox onChange={(e)=>updateAllowSign(e.target.checked,
              ['socialIdentities','linkedIn'])}>
              <UI.LinkedIn/>
              {$t({ defaultMessage: 'LinkedIn' })}
            </UI.Checkbox>
            <Tooltip title={$t({ defaultMessage: 'Edit LinkedIn app' })}
              placement='bottom'>
              {linkedIn&&<LinkedInSetting/>}
            </Tooltip>
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={<>
            {$t({ defaultMessage: 'Here is some information about' })}&nbsp;&nbsp;
            <a href='https://support.ruckuswireless.com/ruckus-cloud-privacy-policy'
              target='_blank'
              rel='noreferrer'>
              {$t({ defaultMessage: 'Ruckus\' privacy policy' })}</a>
          </>}
        />
        <Form.Item>
          <Form.Item
            noStyle
            name='allowedDomainsCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox disabled={!isSocial}
                onChange={(e)=>{
                  if (e.target.checked) {
                    form.setFieldValue('socialDomains', allowedDomainsValue)
                  } else {
                    setAllowedDomainsValue(socialDomains)
                    form.setFieldValue('socialDomains', '')
                  }
                }}>
                {$t({ defaultMessage: 'Allowed Domains' })}
              </Checkbox>
            }
          />
          <Tooltip title={$t({ defaultMessage:
             '{domainToolTip}' }, { domainToolTip: domainToolTip })}
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip>
          <Form.Item
            name='socialDomains'
            initialValue=''
            rules={[
              { required: allowedDomainsCheckbox },
              { validator: (_, value) => URLRegExp(value) }]
            }
            children={
              <Input
                style={{ marginTop: '5px' }}
                placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
                disabled={!allowedDomainsCheckbox}
              />
            }
          />
        </Form.Item>
        <RedirectUrlInput/>
        <Form.Item>
          <Form.Item
            noStyle
            name='socialEmails'
            valuePropName='checked'
            initialValue={false}
            children={

              <Checkbox disabled={!isSocial}>
                {!isSocial&&<Tooltip title={$t({
                  defaultMessage: 'This option applies only when signing ' +
                    'in with social media platforms is supported'
                })}
                placement='bottom'>
                  {collectEmail}
                </Tooltip>}
                {isSocial&&collectEmail}
              </Checkbox>
            }
          />
          <Tooltip title={$t({
            defaultMessage: 'As required for privacy compliance, ' +
              'the user will be informed of that is the case'
          })}
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }}/>
          </Tooltip>
        </Form.Item>
        {enableSmsLogin&&<Form.Item label={$t({ defaultMessage: 'Password expires after' })}>
          <Space align='start'>
            <Form.Item
              noStyle
              name={['smsPasswordDuration', 'duration']}
              initialValue={12}
            >
              <InputNumber data-testid='expireTime' min={1} max={2147483647} />
            </Form.Item>
            <Form.Item noStyle name={['smsPasswordDuration', 'unit']} initialValue={'HOUR'}>
              <Select data-testid='expireUnit'>
                <Option value={'HOUR'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'DAY'}>{$t({ defaultMessage: 'Days' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>}
        <DhcpCheckbox />
      </Col>
      <Col span={12}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.SelfSignIn}/>
      </Col>
    </Row>
  )
}
