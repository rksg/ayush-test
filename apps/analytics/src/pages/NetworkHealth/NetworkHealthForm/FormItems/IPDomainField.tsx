import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { ipDomainValidator } from './validator'

import type { FormItemProps } from 'antd'

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
