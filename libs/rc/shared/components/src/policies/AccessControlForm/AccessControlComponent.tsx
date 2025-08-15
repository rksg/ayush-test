import React from 'react'

import { Form, FormItemProps, Switch } from 'antd'
import { useIntl }                     from 'react-intl'
import styled                          from 'styled-components/macro'

import { AccessControlProfile }       from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import { ApplicationComponent } from './ApplicationComponent'
import { ClientRateLimit }      from './ClientRateLimit'
import { DeviceOSComponent }    from './DeviceOSComponent'
import { Layer2Component }      from './Layer2Component'
import { Layer3Component }      from './Layer3Component'
const { useWatch } = Form

const AccessComponentWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 190px auto;
`

const FieldLabel = styled.div`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: 175px 1fr;
`

const AccessFormItem = (props: FormItemProps<AccessControlProfile>) => {
  return (
    <Form.Item
      style={{ marginBottom: '10px' }}
      valuePropName='checked'
      initialValue={false}
      children={<Switch />}
      {...props} />
  )
}

const AccessControlComponent = () => {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  const [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableClientRateLimit
  ] = [
    useWatch<boolean>('enableLayer2'),
    useWatch<boolean>('enableLayer3'),
    useWatch<boolean>('enableDeviceOs'),
    useWatch<boolean>('enableApplications'),
    useWatch<boolean>('enableClientRateLimit')
  ]

  return (
    <>
      <FieldLabel>
        {$t({ defaultMessage: 'Layer 2' })}
        <AccessComponentWrapper>
          <AccessFormItem name={'enableLayer2'} />
          {enableLayer2 && <Layer2Component />}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel>
        {$t({ defaultMessage: 'Layer 3' })}
        <AccessComponentWrapper>
          <AccessFormItem name={'enableLayer3'} />
          {enableLayer3 && <Layer3Component />}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel>
        {$t({ defaultMessage: 'Device & OS' })}
        <AccessComponentWrapper>
          <AccessFormItem name={'enableDeviceOs'} />
          {enableDeviceOs && <DeviceOSComponent />}
        </AccessComponentWrapper>
      </FieldLabel>

      {!isCore && (<FieldLabel>
        {$t({ defaultMessage: 'Applications' })}
        <AccessComponentWrapper>
          <AccessFormItem name={'enableApplications'} />
          {enableApplications && <ApplicationComponent />}
        </AccessComponentWrapper>
      </FieldLabel>
      )}

      <FieldLabel>
        {$t({ defaultMessage: 'Client Rate Limit' })}
        <AccessComponentWrapper>
          <AccessFormItem name={'enableClientRateLimit'} />
        </AccessComponentWrapper>
        {enableClientRateLimit && <ClientRateLimit inputName={['rateLimiting']} />}
      </FieldLabel>
    </>
  )
}

export default AccessControlComponent
