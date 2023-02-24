
import { Form }                   from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

import { IPDomainField } from './IPDomainField'

const name = ['configs', 0, 'tracerouteAddress'] as const
const label = defineMessage({ defaultMessage: 'Traceroute Destination Address' })

export function TracerouteAddress () {
  const { $t } = useIntl()
  return <IPDomainField name={name as unknown as NamePath} label={$t(label)} />
}

TracerouteAddress.fieldName = name
TracerouteAddress.label = label

TracerouteAddress.FieldSummary = function TracerouteAddressFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}
