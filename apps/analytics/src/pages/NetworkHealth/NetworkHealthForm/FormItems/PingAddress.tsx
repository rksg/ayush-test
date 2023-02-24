import { Form }                   from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

import { IPDomainField } from './IPDomainField'

const name = ['configs', 0, 'pingAddress'] as const
const label = defineMessage({ defaultMessage: 'Ping Destination Address' })

export function PingAddress () {
  const { $t } = useIntl()
  return <IPDomainField name={name as unknown as NamePath} label={$t(label)} />
}

PingAddress.fieldName = name
PingAddress.label = label

PingAddress.FieldSummary = function PingAddressFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}
