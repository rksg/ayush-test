import {
  Form,
  Select
} from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { getRoles }               from '@acx-ui/rc/utils'
import { RolesEnum }              from '@acx-ui/types'

export interface RoleSelectorProps {
  disabled?: boolean;
}

const RoleSelector = (props: RoleSelectorProps) => {
  const dpskRbac=useIsSplitOn(Features.PTENANT_RBAC_DPSK_ROLE_INTRODUCTION)
  const { $t } = useIntl()
  const { disabled } = props
  const rolesList = getRoles().map((item) => ({
    label: $t(item.label),
    value: item.value
  })).filter(item => !(item.value === RolesEnum.DPSK_ADMIN
    && !dpskRbac))

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