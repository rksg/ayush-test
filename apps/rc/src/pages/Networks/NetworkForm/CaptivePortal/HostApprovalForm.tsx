
import { useState } from 'react'

import {
  Checkbox,
  Col,
  Form,
  Row
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }                      from '@acx-ui/components'
import { CaptivePassphraseExpirationEnum,
  GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { captivePasswordExpiration } from '../contentsMap'
import { NetworkDiagram }            from '../NetworkDiagram/NetworkDiagram'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { DomainsInput }     from './DomainsInput'
import { RedirectUrlInput } from './RedirectUrlInput'


export function HostApprovalForm () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const passwordExpiration = useWatch(['hostGuestConfig', 'hostDurationChoices'])
  const [passwordExp, setPasswordExp]=useState((passwordExpiration?.split(',')||[]) as Array<
    keyof typeof CaptivePassphraseExpirationEnum>)
  const expirationKey = Object.keys(CaptivePassphraseExpirationEnum) as Array<
  keyof typeof CaptivePassphraseExpirationEnum>
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Host Settings' })}</StepsForm.Title>
        <DomainsInput required={true}/>
        <Form.Item
          name={['hostGuestConfig', 'hostDurationChoices']}
          label={<>
            {$t({ defaultMessage: 'Password Expiration Options:' })}<br/>
            {$t({ defaultMessage: '(Host will see only selected options)' })}
          </>}
          children={<>
            {expirationKey.map((key) => <div style={{ marginBottom: 5 }}><Checkbox key={key}
              checked={passwordExp.findIndex((val)=> {return val===key})>-1}
              onChange={(e)=>{
                const expirationArray = [...passwordExp]
                if(e.target.checked){
                  expirationArray.push(key)

                }else{
                  expirationArray.map((val, i)=>{
                    if(val===key){
                      return expirationArray.splice(i,1)
                    }
                    return true
                  })
                }
                setPasswordExp(expirationArray)
                form.setFieldValue(['hostGuestConfig', 'hostDurationChoices'],
                  expirationArray.toString())
              }}
            >
              {$t(captivePasswordExpiration[key])}
            </Checkbox></div>)}
          </>
          }
        />
        <RedirectUrlInput/>
        <DhcpCheckbox />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.HostApproval}/>
      </Col>
    </Row>
  )
}
