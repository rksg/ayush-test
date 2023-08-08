import {
  Form,
  Radio,
  RadioChangeEvent
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

interface AuthenticationSelectorProps {
  ssoConfigured: boolean
  setSelected: (selectedAuth: string) => void
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

  let { ssoConfigured, setSelected } = props

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

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
      <Radio.Group
        style={{ width: '100%' }}
        onChange={onSelectModeChange}
      >
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