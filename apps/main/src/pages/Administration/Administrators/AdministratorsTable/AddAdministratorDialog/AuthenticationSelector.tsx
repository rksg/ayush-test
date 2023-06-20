import React from 'react'

import {
  Form,
  Radio
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

export enum ECCustomerRadioButtonEnum {
  sso = 'sso',
  idm = 'idm'
}

export const GetAuthTypeString = (type: ECCustomerRadioButtonEnum) => {
  switch (type) {
    case ECCustomerRadioButtonEnum.sso:
      return defineMessage({ defaultMessage: 'SSO with 3rd Party' })
    case ECCustomerRadioButtonEnum.idm:
      return defineMessage({ defaultMessage: 'RUCKUS Identity Management' })
  }
}

export const getAuthTypes = () => {
  return [
    {
      label: GetAuthTypeString(ECCustomerRadioButtonEnum.sso),
      value: ECCustomerRadioButtonEnum.sso
    },
    {
      label: GetAuthTypeString(ECCustomerRadioButtonEnum.idm),
      value: ECCustomerRadioButtonEnum.idm
    }]
}

const AuthenticationSelector = () => {
  const { $t } = useIntl()

  const authTypesList = getAuthTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Form.Item
      name='authType'
      label={$t({ defaultMessage: 'Authentication Type' })}
      initialValue={ECCustomerRadioButtonEnum.idm}
      rules={[{ required: true }]}
    >
      <Radio.Group style={{ width: '100%' }}>
        <SpaceWrapper full direction='vertical' size='middle'>
          {authTypesList.map((item) => {
            return (
              <Radio value={item.value}>
                {item.label}
              </Radio>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  )
}

export default AuthenticationSelector