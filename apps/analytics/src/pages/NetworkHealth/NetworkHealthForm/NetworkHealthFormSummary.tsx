import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  StepsFormNew,
  useStepFormContext,
  useWatch
} from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import { authMethodsByCode } from '../authMethods'
import * as contents         from '../contents'
import {
  AuthenticationMethod,
  ClientType,
  NetworkHealthFormDto,
  TestType
} from '../types'

type Field <T> = {
  name: keyof T
  label: string
  convert?: (value: unknown) => React.ReactNode
}

export function NetworkHealthFormSummary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const [isCustom, code] = [
    useWatch('isDnsServerCustom', form),
    useWatch('authenticationMethod', form)
  ]

  const spec = authMethodsByCode[code]
  const passwordField = spec?.fields.find(field => field.key === 'wlanPassword')

  const fields: Field<NetworkHealthFormDto>[] = [{
    name: 'name',
    label: 'Test Name'
  }, {
    name: 'clientType',
    label: 'Client Type',
    convert: (value) => $t(contents.clientTypes[value as ClientType])
  },
  {
    name: 'type',
    label: 'Test Type',
    convert: (value) => $t(contents.testTypes[value as TestType])
  },
  {
    name: 'wlanName',
    label: 'Network'
  },
  {
    name: 'authenticationMethod',
    label: 'Authentication Method',
    convert: (code) => $t(authMethodsByCode[code as AuthenticationMethod].title)
  },
  {
    name: 'radio',
    label: 'Radio',
    convert: (value) => formatter('radioFormat')(value)
  },
  ...(spec?.fields.some(field => field.key === 'wlanUsername') ? [{
    name: 'wlanUsername',
    label: 'Username'
  }] : []) as Field<NetworkHealthFormDto>[],
  ...(passwordField ? [{
    name: 'wlanPassword',
    label: 'Password',
    convert: (value) => passwordField.preConfigured
      ? $t({ defaultMessage: 'Using configured password' })
      : Array(String(value).length).fill('*').join('')
  }] : []) as Field<NetworkHealthFormDto>[],
  {
    name: 'dnsServer',
    label: 'DNS Server',
    convert: (value) => isCustom ? String(value) : $t({ defaultMessage: 'Default' })
  },
  {
    name: 'pingAddress',
    label: 'Ping Destination Address'
  },
  {
    name: 'tracerouteAddress',
    label: 'Traceroute Destination Address'
  },
  {
    name: 'speedTestEnabled',
    label: 'Speed Test',
    convert: value => value
      ? $t({ defaultMessage: 'Enabled' })
      : $t({ defaultMessage: 'Disabled' })
  }]

  return <>
    <StepsFormNew.Title children={$t(contents.steps.summary)} />
    {fields.map(field => <Form.Item
      key={field.name}
      name={field.name}
      label={field.label}
      children={<StepsFormNew.FieldSummary<NetworkHealthFormDto[typeof field.name]>
        convert={field.convert}
      />}
    />)}

    {/* TODO */}
    {/* Get total number of APs selected */}
  </>
}

