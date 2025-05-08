
import { useState, useContext, useEffect } from 'react'

import {
  Checkbox,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row
} from 'antd'
import _                             from 'lodash'
import { useIntl, FormattedMessage } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                 from '@acx-ui/icons'
import {
  CaptivePassphraseExpirationEnum,
  NetworkSaveData,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  domainsNameRegExp,
  emailsRegExp,
  emailsSameDomainValidation,
  emailDuplicationValidation,
  emailMaxCountValidation,
  domainNameDuplicationValidation
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { captivePasswordExpiration } from '../contentsMap'
import { NetworkDiagram }            from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext            from '../NetworkFormContext'
import { NetworkMoreSettingsForm }   from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import { AsteriskFormTitle }         from '../styledComponents'

import { DhcpCheckbox }                          from './DhcpCheckbox'
import { RedirectUrlInput }                      from './RedirectUrlInput'
import { BypassCaptiveNetworkAssistantCheckbox } from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }                  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems }                 from './SharedComponent/WlanSecurity/WlanSecuritySettings'

export function HostApprovalForm () {
  const {
    data,
    setData,
    editMode,
    isRuckusAiMode,
    cloneMode
  } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const passwordExpiration = useWatch(['guestPortal','hostGuestConfig','hostDurationChoices'])
  const [domainOrEmail, setDomainOrEmail] = useState('domain')
  const [passwordExp, setPasswordExp]=useState((passwordExpiration||[
    '1','4','24']))
  const expirationKey = Object.keys(CaptivePassphraseExpirationEnum) as Array<
  keyof typeof CaptivePassphraseExpirationEnum>
  const HAEmailList_FeatureFlag = useIsSplitOn(Features.HOST_APPROVAL_EMAIL_LIST_TOGGLE)
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({ ...data })
      setPasswordExp(data.guestPortal?.hostGuestConfig?.hostDurationChoices.toString().split(','))
      if (!_.isEmpty(data.guestPortal?.hostGuestConfig?.hostDomains)) {
        setDomainOrEmail('domain')
      } else if (!_.isEmpty(data.guestPortal?.hostGuestConfig?.hostEmails)) {
        setDomainOrEmail('email')
      }
    }
  }, [data])

  const changeDomainOrEmailList = (e: RadioChangeEvent) => {
    const domainOrEmail = e.target.value
    if (domainOrEmail === 'domain'){
      form.setFieldValue(['guestPortal','hostGuestConfig', 'hostEmails'], undefined)
    }
    if (domainOrEmail === 'email') {
      form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDomains'], undefined)
    }
    setDomainOrEmail(e.target.value)
  }

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Host Settings' })}</StepsFormLegacy.Title>
        <Row>
          <AsteriskFormTitle>
          Host Contacts
          </AsteriskFormTitle>
          { /* eslint-disable max-len */ }
          <Tooltip title={
            <FormattedMessage
              values={{ br: () => <br />, b: (chunks) => <b>{chunks}</b> }}
              defaultMessage={
                `<b>Entire Domain:</b> Guests can request approval from any email address within the domain to connect to the network.<br></br>
                    <b>Specific Email Contacts:</b> Guests must seek approval only from the provided email addresses to connect to the network.`
              }
            />
          }
          placement='bottom'>
            <QuestionMarkCircleOutlined style={{ width: '16px', marginLeft: 3, marginTop: -3 }} />
          </Tooltip>
        </Row>
        {HAEmailList_FeatureFlag ?
          <Radio.Group onChange={changeDomainOrEmailList} value={domainOrEmail}>
            <Row>
              <Radio value='domain' style={{ marginBottom: '5px' }}>
              Entire Domain
              </Radio>
            </Row>
            {domainOrEmail === 'domain' &&
            <Form.Item
              name={['guestPortal','hostGuestConfig', 'hostDomains']}
              rules={[
                { required: true, message: $t(validationMessages.domains) },
                { validator: (_, value) => domainsNameRegExp(
                  (Array.isArray(value)? value : value.split(',')), true)
                },
                { validator: (rule, value) => domainNameDuplicationValidation((Array.isArray(value)? value : value.split(','))) }
              ]
              }
              validateFirst
              hasFeedback
              style={{ marginBottom: '5px' }}
              children={
                <Input onChange={(e)=>
                  form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDomains'],
                    e.target.value.split(','))
                }
                placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
                />
              }
            />
            }
            <Row>
              <Radio value='email' style={{ marginBottom: '5px' }}>
              Specific E-mail Contacts
              </Radio>
            </Row>
            { domainOrEmail === 'email' &&
            <Form.Item
              name={['guestPortal','hostGuestConfig', 'hostEmails']}
              rules={[
                { required: true },
                { validator: (rule, value) => emailsRegExp((Array.isArray(value)? value : value.split(','))) },
                { validator: (rule, value) => emailsSameDomainValidation((Array.isArray(value)? value : value.split(','))) },
                { validator: (rule, value) => emailDuplicationValidation((Array.isArray(value)? value : value.split(','))) },
                { validator: (rule, value) => emailMaxCountValidation((Array.isArray(value)? value : value.split(',')), 100) }
              ]
              }
              normalize={(value: string) => value.split(',').map((text: string)=>text.replace(/\n/, '').trim())}
              validateFirst
              hasFeedback
              style={{ marginBottom: '5px' }}
              children={
                <Input.TextArea
                  placeholder={$t({ defaultMessage: 'Enter email addresses, separated by commas. Ensure all addresses are from the same domain' })}
                />
              }
            />
            }
          </Radio.Group>
          :
          <Form.Item
            name={['guestPortal','hostGuestConfig', 'hostDomains']}
            rules={[
              { required: true },
              { validator: (_, value) => domainsNameRegExp(
                (Array.isArray(value)? value : value.split(',')), true)
              }]
            }
            validateFirst
            hasFeedback
            children={
              <Input onChange={(e)=>
                form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDomains'],
                  e.target.value.split(','))
              }
              placeholder={$t({ defaultMessage: 'Enter domain(s) separated by comma' })}
              />
            }
          />
        }

        <Form.Item
          name={['guestPortal','hostGuestConfig', 'hostDurationChoices']}
          initialValue={['1','4','24']}
          label={<>
            {$t({ defaultMessage: 'Password Expiration Options:' })}<br/>
            {$t({ defaultMessage: '(Host will see only selected options)' })}
          </>}
          children={<>
            {expirationKey.map((key) => <div key={key+'hostDiv'} style={{ marginBottom: 5 }}>
              <Checkbox key={key+'host'}
                checked={passwordExp.findIndex((val:string)=> {
                  return val===CaptivePassphraseExpirationEnum[key]})>-1}
                disabled={passwordExp.length===1&&
                  passwordExp.findIndex((val:string)=> {
                    return val===CaptivePassphraseExpirationEnum[key]})>-1}
                onChange={(e)=>{
                  const expirationArray = [...passwordExp]
                  if(e.target.checked){
                    expirationArray.push(CaptivePassphraseExpirationEnum[key])

                  }else{
                    expirationArray.map((val, i)=>{
                      if(val===CaptivePassphraseExpirationEnum[key]){
                        return expirationArray.splice(i,1)
                      }
                      return true
                    })
                  }
                  setPasswordExp(expirationArray)
                  form.setFieldValue(['guestPortal','hostGuestConfig', 'hostDurationChoices'],
                    expirationArray)
                  if(editMode && data) {
                    setData && setData({
                      ...data,
                      guestPortal: {
                        ...data.guestPortal,
                        hostGuestConfig: {
                          hostEmails: form.getFieldValue(['guestPortal','hostGuestConfig', 'hostEmails']),
                          hostDomains: form.getFieldValue(['guestPortal','hostGuestConfig', 'hostDomains']),
                          hostDurationChoices: expirationArray
                        }
                      }
                    })
                  }
                }}
              >
                {$t(captivePasswordExpiration[CaptivePassphraseExpirationEnum[key]])}
              </Checkbox></div>)}
          </>
          }
        />
        <WlanSecurityFormItems />
        <RedirectUrlInput/>
        <DhcpCheckbox />
        <BypassCaptiveNetworkAssistantCheckbox/>
        <WalledGardenTextArea
          enableDefaultWalledGarden={false} />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.HostApproval}
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
