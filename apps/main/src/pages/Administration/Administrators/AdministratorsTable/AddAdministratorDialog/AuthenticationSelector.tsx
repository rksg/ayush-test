import React from 'react'

import {
  Form,
  Radio
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

interface AuthenticationSelectorProps {
  ssoConfigured: boolean
}

export enum AuthTypeRadioButtonEnum {
  sso = 'sso',
  idm = 'idm'
}

export const GetAuthTypeString = (type: AuthTypeRadioButtonEnum) => {
  switch (type) {
    case AuthTypeRadioButtonEnum.sso:
      return defineMessage({ defaultMessage: 'SSO with 3rd Party' })
    case AuthTypeRadioButtonEnum.idm:
      return defineMessage({ defaultMessage: 'RUCKUS Identity Management' })
  }
}

export const getAuthTypes = () => {
  return [
    {
      label: GetAuthTypeString(AuthTypeRadioButtonEnum.sso),
      value: AuthTypeRadioButtonEnum.sso
    },
    {
      label: GetAuthTypeString(AuthTypeRadioButtonEnum.idm),
      value: AuthTypeRadioButtonEnum.idm
    }]
}

const AuthenticationSelector = (props: AuthenticationSelectorProps) => {
  const { $t } = useIntl()

  const { ssoConfigured } = props

  const authTypesList = getAuthTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Form.Item
      name='authType'
      label={$t({ defaultMessage: 'Authentication Type' })}
      initialValue={AuthTypeRadioButtonEnum.idm}
      rules={[{ required: true }]}
    >
      <Radio.Group style={{ width: '100%' }}>
        <SpaceWrapper full direction='vertical' size='middle'>
          {authTypesList.map((item) => {
            return (
              <Radio disabled={!ssoConfigured && item.value === AuthTypeRadioButtonEnum.sso}
                value={item.value}>
                {item.label}
              </Radio>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  )
}

export default AuthenticationSelector