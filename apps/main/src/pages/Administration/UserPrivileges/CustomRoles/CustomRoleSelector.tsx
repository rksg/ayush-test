import {
  Form,
  Select
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetCustomRolesQuery } from '@acx-ui/rc/services'
import { RolesEnum }              from '@acx-ui/types'
import { roleStringMap }          from '@acx-ui/user'

export interface CustomRoleSelectorProps {
    disabled?: boolean;
  }

const CustomRoleSelector = (props: CustomRoleSelectorProps) => {
  const { $t } = useIntl()
  const { disabled } = props
  const params = useParams()
  const { data: roleList } = useGetCustomRolesQuery({ params })

  const rolesList = roleList?.map((item) => ({
    label: roleStringMap[item.name as RolesEnum]
      ? $t(roleStringMap[item.name as RolesEnum]) : item.name,
    value: item.name
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

export default CustomRoleSelector