import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import * as contents             from '../../contents'
import { TestType as ETestType } from '../../types'

export function TestType () {
  const { $t } = useIntl()
  const options = [
    ETestType.OnDemand,
    ETestType.Scheduled
  ].map(type => <Select.Option
    key={type}
    value={type}
    children={$t(contents.testTypes[type])}
  />)

  return <Form.Item
    name='type'
    label={$t({ defaultMessage: 'Test Type' })}
    children={<Select disabled>{options}</Select>}
  />
}
