import React from 'react'

import {
  Form,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SpaceWrapper }           from '@acx-ui/rc/components'

import * as UI from './styledComponents'


interface AuthenticationSelectorProps {
  ssoConfigured: boolean
  setSelected: (selectedAuth: AuthTypeRadioButtonEnum) => void
}

export enum AuthTypeRadioButtonEnum {
  sso = 'sso',
  idm = 'idm',
  commonAccount = 'commonAccount'
}

export const GetAuthTypeString = (type: AuthTypeRadioButtonEnum) => {
  switch (type) {
    case AuthTypeRadioButtonEnum.sso:
      return defineMessage({ defaultMessage: 'SSO with 3rd Party' })
    case AuthTypeRadioButtonEnum.idm:
      return defineMessage({ defaultMessage: 'RUCKUS Identity Management' })
    case AuthTypeRadioButtonEnum.commonAccount:
      return defineMessage({ defaultMessage: 'Ruckus Account Management' })
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

export const getAuthTypesWithCAM = () => {
  return [
    {
      label: GetAuthTypeString(AuthTypeRadioButtonEnum.sso),
      value: AuthTypeRadioButtonEnum.sso
    },
    {
      label: GetAuthTypeString(AuthTypeRadioButtonEnum.commonAccount),
      value: AuthTypeRadioButtonEnum.commonAccount
    }]
}

const AuthenticationSelector = (props: AuthenticationSelectorProps) => {
  const { $t } = useIntl()

  const isCAMFFEnabled = useIsSplitOn(Features.PTENANT_TO_COMMON_ACCOUNT_MANAGEMENT_TOGGLE)

  let { ssoConfigured, setSelected } = props

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const authTypes = isCAMFFEnabled ? getAuthTypesWithCAM() : getAuthTypes()
  const authTypesList = authTypes.map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Form.Item
      name='authType'
      label={$t({ defaultMessage: 'Authentication Type' })}
      initialValue={isCAMFFEnabled
        ? AuthTypeRadioButtonEnum.commonAccount
        : AuthTypeRadioButtonEnum.idm}
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
                <Radio disabled={!ssoConfigured && item.value === AuthTypeRadioButtonEnum.sso}
                  value={item.value}>
                  {item.label}
                </Radio>
              </React.Fragment>
            )})}
        </SpaceWrapper>

        <Form.Item
          noStyle
          dependencies={['authType']}
        >
          {({ getFieldValue }) => {
            return (getFieldValue('authType') === AuthTypeRadioButtonEnum.idm && !isCAMFFEnabled)
              ? (
                <UI.RadioLabel>
                  {$t({ defaultMessage: 'To use this authentication type,'+
                            ' a new administrator must be activated on the RUCKUS One account.' })}
                </UI.RadioLabel>)
              : null
          }}
        </Form.Item>
      </Radio.Group>
    </Form.Item>
  )
}

export default AuthenticationSelector