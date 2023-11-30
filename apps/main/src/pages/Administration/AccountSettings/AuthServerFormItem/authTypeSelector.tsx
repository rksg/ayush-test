import React from 'react'

import {
  Form,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

interface AuthTypeSelectorProps {
  ssoConfigured: boolean
  setSelected: (selectedAuth: string) => void
}

export enum AuthTypeEnum {
  saml = 'saml',
  google = 'google'
}

export const GetAuthTypeString = (type: AuthTypeEnum) => {
  switch (type) {
    case AuthTypeEnum.saml:
      return defineMessage({ defaultMessage: 'SAML' })
    case AuthTypeEnum.google:
      return defineMessage({ defaultMessage: 'Google Workspace' })
  }
}

export const getAuthTypes = () => {
  return [
    {
      label: GetAuthTypeString(AuthTypeEnum.saml),
      value: AuthTypeEnum.saml
    },
    {
      label: GetAuthTypeString(AuthTypeEnum.google),
      value: AuthTypeEnum.google
    }]
}

const AuthTypeSelector = (props: AuthTypeSelectorProps) => {
  const { $t } = useIntl()

  let { ssoConfigured, setSelected } = props

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const authTypesList = getAuthTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return <Form layout='vertical'>
    <Form.Item
      name='authType'
      label={$t({ defaultMessage: 'Authentication Type' })}
      initialValue={AuthTypeEnum.google}
      rules={[{ required: true }]}
    >
      <Radio.Group
        style={{ width: '100%' }}
        onChange={onSelectModeChange}
      >
        <SpaceWrapper full direction='vertical' size='middle'>
          {authTypesList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio disabled={!ssoConfigured && item.value === AuthTypeEnum.saml}
                  value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  </Form>
//   )
}

export default AuthTypeSelector