import React from 'react'

import {
  Form,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper }             from '@acx-ui/components'
import { TenantAuthenticationType } from '@acx-ui/rc/utils'

interface AuthTypeSelectorProps {
  ssoConfigured: boolean
  setSelected: (selectedAuth: string) => void
}

const getAuthTypeString = (type: TenantAuthenticationType) => {
  switch (type) {
    case TenantAuthenticationType.saml:
      return defineMessage({ defaultMessage: 'SAML' })
    case TenantAuthenticationType.google_workspace:
      return defineMessage({ defaultMessage: 'Google Workspace' })
  }
  return defineMessage({ defaultMessage: 'SAML' })
}

export const getAuthTypes = () => {
  return [
    {
      label: getAuthTypeString(TenantAuthenticationType.saml),
      value: TenantAuthenticationType.saml
    },
    {
      label: getAuthTypeString(TenantAuthenticationType.google_workspace),
      value: TenantAuthenticationType.google_workspace
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
      label={$t({ defaultMessage: 'Auth Type' })}
      initialValue={TenantAuthenticationType.saml}
    >
      <Radio.Group
        style={{ width: '100%' }}
        onChange={onSelectModeChange}
      >
        <SpaceWrapper full direction='vertical' size='middle'>
          {authTypesList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio disabled={!ssoConfigured && item.value === TenantAuthenticationType.saml}
                  value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  </Form>
}

export default AuthTypeSelector
