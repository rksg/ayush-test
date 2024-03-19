import {
  Form,
  Select
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetPrivilegeGroupsQuery } from '@acx-ui/rc/services'
import { RolesEnum }                  from '@acx-ui/types'
import { roleStringMap }              from '@acx-ui/user'

export interface PrivilegeGroupSelectorProps {
      disabled?: boolean;
    }

const PrivilegeGroupSelector = (props: PrivilegeGroupSelectorProps) => {
  const { $t } = useIntl()
  const { disabled } = props
  const params = useParams()
  const { data: roleList } = useGetPrivilegeGroupsQuery({ params })

  const rolesList = roleList?.map((item) => ({
    label: roleStringMap[item.name as RolesEnum]
      ? $t(roleStringMap[item.name as RolesEnum]) : item.name,
    value: item.name
  }))

  return (
    <Form.Item
      name='role'
      label={$t({ defaultMessage: 'Privilege Group' })}
      rules={[{ required: true }]}
    >
      <Select
        options={rolesList}
        disabled={disabled}
        placeholder={$t({ defaultMessage: 'Select Group' })}
      />
    </Form.Item>
  )
}

export default PrivilegeGroupSelector