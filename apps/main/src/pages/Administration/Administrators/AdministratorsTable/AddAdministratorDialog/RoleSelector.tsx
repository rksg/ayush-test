import {
  Form,
  Select
} from 'antd'
import { useIntl } from 'react-intl'

import { getRoles } from '@acx-ui/rc/services'

export interface RoleSelectorProps {
  disabled?: boolean;
}

const RoleSelector = (props: RoleSelectorProps) => {
  const { $t } = useIntl()
  const { disabled } = props
  const rolesList = getRoles().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Form.Item
      name='role'
      label={$t({ defaultMessage: 'Role' })}
      rules={[{ required: true }]}
    >
      <Select
        options={rolesList}
        disabled={disabled}
        placeholder={$t({ defaultMessage: 'Select Role' })}
      />
    </Form.Item>
  )
}

export default RoleSelector