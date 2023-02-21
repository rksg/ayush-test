import { Form, Input } from 'antd'
import { RuleObject }  from 'antd/lib/form'
import { useIntl }     from 'react-intl'

import { domainNameRegExp, networkWifiIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }           from '@acx-ui/utils'

import type { FormItemProps } from 'antd'

function isRejected <T,> (p: PromiseSettledResult<T>): p is PromiseRejectedResult {
  return p.status === 'rejected'
}

async function ipDomainValidator (rule: RuleObject, value: string) {
  const { $t } = getIntl()
  const results = await Promise.allSettled([
    networkWifiIpRegExp(value),
    domainNameRegExp(value)
  ])

  const errors = results.filter(isRejected).map(p => p.reason)
  if (errors.length < 2) return

  throw $t(validationMessages.ipDomain)
}

type IPDomainFieldProps = Required<
  Pick<FormItemProps, 'name' | 'label'>
>

export function IPDomainField (props: IPDomainFieldProps) {
  const { $t } = useIntl()
  const placeholder = $t({ defaultMessage: 'Enter an IP address or a domain' })
  return <Form.Item
    validateFirst
    name={props.name}
    label={props.label}
    rules={[
      { max: 127, type: 'string' },
      { validator: ipDomainValidator }
    ]}
    children={<Input {...{ placeholder }} />}
  />
}
