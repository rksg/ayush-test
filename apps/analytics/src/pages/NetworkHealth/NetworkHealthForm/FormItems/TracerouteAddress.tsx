
import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsFormNew } from '@acx-ui/components'

import { IPDomainField } from './IPDomainField'

const name = 'tracerouteAddress' as const
const label = defineMessage({ defaultMessage: 'Traceroute Destination Address' })

export function TracerouteAddress () {
  const { $t } = useIntl()
  return <IPDomainField name={name} label={$t(label)} />
}

TracerouteAddress.fieldName = name
TracerouteAddress.label = label

TracerouteAddress.FieldSummary = function TracerouteAddressFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}
