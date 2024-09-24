import {
  Form,
  Select
} from 'antd'
import { without }   from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useGetCustomRolesQuery } from '@acx-ui/rc/services'
import { RolesEnum }              from '@acx-ui/types'
import { roleStringMap }          from '@acx-ui/user'

export interface CustomRoleSelectorProps {
    disabled?: boolean;
    isOnboardedMsp?: boolean;
    setSelected: (selected: RolesEnum) => void
  }

const NonSupportedRoles = [
  RolesEnum.PRIME_ADMIN,
  RolesEnum.DPSK_ADMIN,
  RolesEnum.GUEST_MANAGER
]

const CustomRoleSelector = (props: CustomRoleSelectorProps) => {
  const { $t } = useIntl()
  const { disabled, isOnboardedMsp, setSelected } = props
  const params = useParams()
  const isRbacP2Enabled = useIsSplitOn(Features.RBAC_IMPLICIT_P2)

  const { data: roleList } = useGetCustomRolesQuery({ params })

  const rolesToBeRemoved = (isRbacP2Enabled && isOnboardedMsp)
    ? [...without(NonSupportedRoles, RolesEnum.PRIME_ADMIN)] : NonSupportedRoles

  const rolesList = roleList?.filter(item =>
    !rolesToBeRemoved.includes(item.name as RolesEnum)).map((item) => ({
    label: roleStringMap[item.name as RolesEnum]
      ? $t(roleStringMap[item.name as RolesEnum]) : item.name,
    value: item.name
  }))

  const handleRoleChange = (value: string) => {
    setSelected(value as RolesEnum)
  }

  return (
    <Form.Item
      name='role'
      label={$t({ defaultMessage: 'Role' })}
      rules={[{ required: true }]}
    >
      <Select
        options={rolesList}
        disabled={disabled}
        onChange={value => handleRoleChange(value)}
        placeholder={$t({ defaultMessage: 'Select Role' })}
      />
    </Form.Item>
  )
}

export default CustomRoleSelector