/* eslint-disable max-len */
import { useState, useContext, useEffect } from 'react'

import {
  Checkbox,
  InputNumber,
  Form,
  Select,
  Space,
  Input
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { get }                                        from '@acx-ui/config'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { useGetNotificationSmsQuery }                      from '@acx-ui/rc/services'
import {
  domainsNameRegExp, NetworkSaveData,
  GuestNetworkTypeEnum, NetworkTypeEnum, SmsProviderType
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import FacebookSetting                           from './FacebookSetting'
import GoogleSetting                             from './GoogleSetting'
import LinkedInSetting                           from './LinkedInSetting'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { SMSTokenCheckbox, isSMSTokenAvailable } from './SharedComponent/SMSToken/SMSTokenCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WhatsAppTokenCheckbox }                 from './SharedComponent/WhatsAppToken/WhatsAppTokenCheckbox'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'
import TwitterSetting                            from './TwitterSetting'

export const SelfSignInAppStyle = { marginBottom: '0' }


export function SelfSignInForm () {
  const {
    data,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const [
    allowedDomainsCheckbox,
    socialDomains,
    enableSmsLogin,
    enableEmailLogin,
    enableWhatsappLogin,
    facebook,
    google,
    twitter,
    linkedin
  ] = [
    useWatch('allowedDomainsCheckbox'),
    useWatch(['guestPortal', 'socialDomains']),
    useWatch(['guestPortal', 'enableSmsLogin']),
    useWatch(['guestPortal', 'enableEmailLogin']),
    useWatch(['guestPortal', 'enableWhatsappLogin']),
    useWatch(['guestPortal', 'socialIdentities', 'facebook']),
    useWatch(['guestPortal', 'socialIdentities', 'google']),
    useWatch(['guestPortal', 'socialIdentities', 'twitter']),
    useWatch(['guestPortal', 'socialIdentities', 'linkedin'])
  ]
  const [allowedDomainsValue, setAllowedDomainsValue] = useState('')
  const [allowedSignValue, setAllowedSignValue] = useState([] as Array<string>)
  const { $t } = useIntl()
  const { Option } = Select
  const domainToolTip = 'Only clients registering with email addresses ' +
    'from these domains will be allowed to connect to the network. ' +
    'Not applicable for SMS registration (if enabled)'
  const isSocial = facebook || google || twitter || linkedin
  const collectEmail = $t({
    defaultMessage:
      'Collect email addresses of users who connect to this network'
  })
  const linkedInNote = $t({
    defaultMessage:
      'Please note'
  })
  const linkedInInfo = $t({
    defaultMessage:
      '“Sign In with LinkedIn” has been deprecated as of August 1, 2023. ' +
      'Please switch to “Sign In with LinkedIn using OpenID Connect”' +
      ' to ensure that your service is not interrupted.'
  })
  const isEnabledLinkedInOIDC = useIsSplitOn(Features.LINKEDIN_OIDC_TOGGLE)
  const isEnabledEmailOTP = useIsSplitOn(Features.GUEST_EMAIL_OTP_SELF_SIGN_TOGGLE)
  const isSmsProviderEnabled = useIsSplitOn(Features.NUVO_SMS_PROVIDER_TOGGLE)
  const isGracePeriodEnabled = useIsSplitOn(Features.NUVO_SMS_GRACE_PERIOD_TOGGLE)
  const params = useParams()
  const smsUsage = useGetNotificationSmsQuery({ params }, { skip: !isSmsProviderEnabled })
  const provider = smsUsage?.data?.provider ?? SmsProviderType.RUCKUS_ONE
  const usedSMS = smsUsage?.data?.ruckusOneUsed ?? 0
  const isRestEnableSmsLogin = cloneMode && !isSMSTokenAvailable(usedSMS, provider, {
    isSmsProviderEnabled, isGracePeriodEnabled
  })

  const updateAllowSign = (checked: boolean, name: Array<string>) => {
    form.setFieldValue(name, checked)
    if (!checked) {
      delete form.getFieldValue([name[0], name[1]])[name[2]]
    }
    const allowedSignValueTemp = [...allowedSignValue]
    if (checked) {
      allowedSignValueTemp.push(name[2] || name[1])
    } else {
      allowedSignValueTemp.map((val, i) => {
        if (val === (name[2] || name[1])) {
          return allowedSignValueTemp.splice(i, 1)
        }
        return true
      })
    }
    if (allowedSignValueTemp.length < 1 ||
      (allowedSignValueTemp.length === 1 && allowedSignValueTemp[0] === 'enableSmsLogin')) {
      form.setFieldValue('allowedDomainsCheckbox', false)
      form.setFieldValue(['guestPortal', 'socialEmails'], false)
      form.setFieldValue(['guestPortal', 'socialDomains'], [])
    }
    form.setFieldValue('allowSign', allowedSignValueTemp)
    setAllowedSignValue(allowedSignValueTemp)
  }

  const checkSocial = (value: string | string[]) => {
    if (!value || value.length < 1) {
      return Promise.reject($t({ defaultMessage: 'Please configure sign-in option' }))
    }
    if (facebook && !form.getFieldValue(['guestPortal', 'socialIdentities',
      'facebook', 'config', 'appId'])) {
      return Promise.reject($t({ defaultMessage: 'Please configure facebook' }))
    }
    if (google && !form.getFieldValue(['guestPortal', 'socialIdentities',
      'google', 'config', 'appId'])) {
      return Promise.reject($t({ defaultMessage: 'Please configure google' }))
    }
    if (twitter && !form.getFieldValue(['guestPortal', 'socialIdentities',
      'twitter', 'config', 'appId'])) {
      return Promise.reject($t({ defaultMessage: 'Please configure twitter' }))
    }
    if (linkedin && !form.getFieldValue(['guestPortal', 'socialIdentities',
      'linkedin', 'config', 'appId'])) {
      return Promise.reject($t({ defaultMessage: 'Please configure linkedin' }))
    }
    return Promise.resolve()
  }
  useEffect(() => {
    if ((editMode || cloneMode) && data) {
      form.setFieldsValue({ ...data })
      if (data.guestPortal?.socialDomains?.[0]) {
        form.setFieldValue('allowedDomainsCheckbox', true)
      }
      if (data.guestPortal?.redirectUrl) {
        form.setFieldValue('redirectCheckbox', true)
      }
      const allowedSignValueTemp = []
      if (data.guestPortal?.enableSmsLogin && !isRestEnableSmsLogin) {
        allowedSignValueTemp.push('enableSmsLogin')
      }
      if (data.guestPortal?.enableEmailLogin) {
        allowedSignValueTemp.push('enableEmailLogin')
      }
      if (data.guestPortal?.enableWhatsappLogin) {
        allowedSignValueTemp.push('enableWhatsappLogin')
      }
      if (data.guestPortal?.socialIdentities?.facebook) {
        allowedSignValueTemp.push('facebook')
      }
      if (data.guestPortal?.socialIdentities?.google) {
        allowedSignValueTemp.push('google')
      }
      if (data.guestPortal?.socialIdentities?.twitter) {
        allowedSignValueTemp.push('twitter')
      }
      if (data.guestPortal?.socialIdentities?.linkedin) {
        allowedSignValueTemp.push('linkedin')
      }
      form.setFieldValue('allowSign', allowedSignValueTemp)
      setAllowedSignValue(allowedSignValueTemp)
    }
    if(!editMode) {
      if (isRestEnableSmsLogin)
        form.setFieldValue(['guestPortal', 'enableSmsLogin'], false)
    }
  }, [data])
  const globalValues= get('CAPTIVE_PORTAL_DOMAIN_NAME')
  const [redirectURL, setRedirectURL]=useState('')
  useEffect(()=>{
    if(globalValues){
      setRedirectURL(globalValues)
    }
  }, [globalValues])

  return (<>
    <GridRow>
      <GridCol col={{ span: 12 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Onboarding' })}</StepsFormLegacy.Title>
        <Form.Item
          name='allowSign'
          initialValue={[]}
          rules={[
            { validator: (_, value) => checkSocial(value) }
          ]}
          label={<>
            {$t({ defaultMessage: 'Allow Sign-In Using: (At least one option must be selected)' })}
          </>}
        ><>
            <SMSTokenCheckbox SMSUsage={smsUsage.data} onChange={updateAllowSign} />
            { isEnabledEmailOTP && <Form.Item name={['guestPortal', 'enableEmailLogin']}
              initialValue={false}
              style={SelfSignInAppStyle}>
              <>
                <UI.Checkbox onChange={(e) => updateAllowSign(e.target.checked,
                  ['guestPortal', 'enableEmailLogin'])}
                checked={enableEmailLogin}>
                  <UI.EMailOTP />
                  {$t({ defaultMessage: 'Email' })}
                </UI.Checkbox>
                <Tooltip title={$t({
                  defaultMessage: 'Self-service signup ' +
                  'using one time token sent to an email address'
                })}
                placement='bottom'>
                  <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
                </Tooltip>
              </>
            </Form.Item>
            }
            <WhatsAppTokenCheckbox SMSUsage={smsUsage.data} onChange={updateAllowSign} />
            <Form.Item name={['guestPortal', 'socialIdentities', 'facebook']}
              initialValue={false}
              style={SelfSignInAppStyle}>
              <>
                <UI.Checkbox onChange={(e) => updateAllowSign(e.target.checked,
                  ['guestPortal', 'socialIdentities', 'facebook'])}
                checked={facebook}>
                  <UI.Facebook />
                  {$t({ defaultMessage: 'Facebook' })}
                </UI.Checkbox>
                {facebook && <FacebookSetting redirectURL={redirectURL}/>}
              </>
            </Form.Item>
            <Form.Item name={['guestPortal', 'socialIdentities', 'google']}
              initialValue={false}
              style={SelfSignInAppStyle}>
              <>
                <UI.Checkbox onChange={(e) => updateAllowSign(e.target.checked,
                  ['guestPortal', 'socialIdentities', 'google'])}
                checked={google}>
                  <UI.Google />
                  {$t({ defaultMessage: 'Google' })}
                </UI.Checkbox>
                {google && <GoogleSetting redirectURL={redirectURL}/>}
              </>
            </Form.Item>
            <Form.Item name={['guestPortal', 'socialIdentities', 'twitter']}
              initialValue={false}
              style={SelfSignInAppStyle}>
              <>
                <UI.Checkbox onChange={(e) => updateAllowSign(e.target.checked,
                  ['guestPortal', 'socialIdentities', 'twitter'])}
                checked={twitter}>
                  <UI.Twitter />
                  {$t({ defaultMessage: 'X' })}
                </UI.Checkbox>
                {twitter && <TwitterSetting redirectURL={redirectURL}/>}
              </>
            </Form.Item>
            <Form.Item name={['guestPortal', 'socialIdentities', 'linkedin']}
              initialValue={false}
              style={SelfSignInAppStyle}>
              <>
                <UI.Checkbox onChange={(e) => updateAllowSign(e.target.checked,
                  ['guestPortal', 'socialIdentities', 'linkedin'])}
                checked={linkedin}>
                  <UI.LinkedIn />
                  {$t({ defaultMessage: 'LinkedIn' })}
                </UI.Checkbox>
                {linkedin && <LinkedInSetting redirectURL={redirectURL}/>}
                {editMode && linkedin && isEnabledLinkedInOIDC &&
                  <Tooltip title={
                    <FormattedMessage
                      defaultMessage={
                        '<titleBold></titleBold><br></br>{linkedInInfo}'
                      }
                      values={{
                        linkedInInfo,
                        titleBold: ()=> <UI.TitleBold>{`${linkedInNote}:`}</UI.TitleBold>,
                        br: () => <br />
                      }}
                    />
                  }
                  placement='bottom' >
                    <UI.InfoIcon/>
                  </Tooltip>}
              </>
            </Form.Item></>
        </Form.Item>
        <Form.Item
          label={<>
            {$t({ defaultMessage: 'Here is some information about' })}&nbsp;&nbsp;
            <a href='https://www.commscope.com/about-us/privacy-statement/'
              target='_blank'
              rel='noreferrer'>
              {$t({ defaultMessage: 'Ruckus Networks’ privacy policy' })}</a>
          </>}
        >
        </Form.Item>
        <WlanSecurityFormItems />
        <Form.Item><>
          <Form.Item
            noStyle
            name='allowedDomainsCheckbox'
            valuePropName='checked'
            initialValue={false}
            children={
              <Checkbox disabled={!(isSocial || enableEmailLogin)}
                onChange={(e) => {
                  if (e.target.checked) {
                    form.setFieldValue(['guestPortal', 'socialDomains'], allowedDomainsValue)
                  } else {
                    setAllowedDomainsValue(socialDomains)
                    form.setFieldValue(['guestPortal', 'socialDomains'], [])
                  }
                }}>
                {$t({ defaultMessage: 'Allowed Domains' })}
              </Checkbox>
            }
          />
          <Tooltip title={$t({
            defaultMessage:
              '{domainToolTip}'
          }, { domainToolTip: domainToolTip })}
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip>
          <Form.Item
            name={['guestPortal', 'socialDomains']}
            initialValue={[]}
            rules={[
              { required: allowedDomainsCheckbox,
                message: $t(validationMessages.domains) },
              { validator: (_, value) => domainsNameRegExp(
                Array.isArray(value) ? value : value.split(','), allowedDomainsCheckbox)
              }]
            }
            validateFirst
            children={
              <Input
                style={{ marginTop: '5px' }}
                placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
                disabled={!allowedDomainsCheckbox}
                onChange={(e) => form.setFieldValue(['guestPortal', 'socialDomains'],
                  e.target.value.split(','))}
              />
            }
          /></>
        </Form.Item>
        <RedirectUrlInput />
        <Form.Item><>
          <Form.Item
            noStyle
            name={['guestPortal', 'socialEmails']}
            valuePropName='checked'
            initialValue={false}>
            <Checkbox disabled={!(isSocial || enableEmailLogin)}>
              {!isSocial && <Tooltip title={$t({
                defaultMessage: 'This option applies only when signing ' +
                  'in with social media platforms is supported'
              })}
              placement='bottom'>
                {collectEmail}
              </Tooltip>}
              {isSocial && collectEmail}
            </Checkbox>
          </Form.Item>
          <Tooltip title={$t({
            // eslint-disable-next-line max-len
            defaultMessage: 'If this option is selected, users will be informed their personal information is being collected'
          })}
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
          </Tooltip></>
        </Form.Item>
        {(enableSmsLogin || enableEmailLogin || enableWhatsappLogin) &&
        <Form.Item label={$t({ defaultMessage: 'Password expires after' })}>
          <Space align='start'>
            <Form.Item
              noStyle
              name={['guestPortal', 'smsPasswordDuration', 'duration']}
              initialValue={12}
            >
              <InputNumber data-testid='expireTime' min={1} max={2147483647} />
            </Form.Item>
            <Form.Item noStyle
              name={['guestPortal', 'smsPasswordDuration', 'unit']}
              initialValue={'HOUR'}>
              <Select data-testid='expireUnit'>
                <Option value={'HOUR'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'DAY'}>{$t({ defaultMessage: 'Days' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>}
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 12 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.SelfSignIn}
          wlanSecurity={data?.wlan?.wlanSecurity} />
      </GridCol>
    </GridRow>
    {!(editMode) && !(isRuckusAiMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
      </GridCol>
    </GridRow>}
  </>
  )
}
