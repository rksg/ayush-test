import {
  Form,
  Select
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetPrivilegeGroupsQuery } from '@acx-ui/rc/services'
import { PrivilegeGroup }             from '@acx-ui/rc/utils'
import { RolesEnum }                  from '@acx-ui/types'
import { roleStringMap }              from '@acx-ui/user'

export interface PrivilegeGroupSelectorProps {
      disabled?: boolean;
      setSelected?: (selected: PrivilegeGroup) => void
  }

const PrivilegeGroupSelector = (props: PrivilegeGroupSelectorProps) => {
  const { $t } = useIntl()
  const { disabled, setSelected } = props
  const params = useParams()
  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({ params })

  const rolesList = privilegeGroupList?.map((item) => ({
    label: roleStringMap[item.name as RolesEnum]
      ? $t(roleStringMap[item.name as RolesEnum]) : item.name ?? '',
    value: item.name
  })).sort((a, b) => {
    const labelA = a.label.toUpperCase()
    const labelB = b.label.toUpperCase()
    return (labelA > labelB) ? 1 : (labelA < labelB ? -1 : 0)
  })

  const handleChange = (value: string) => {
    const selected = privilegeGroupList?.find(p => p.name === value) as PrivilegeGroup
    setSelected?.(selected)
  }

  return (
    <Form.Item
      name='role'
      label={$t({ defaultMessage: 'Privilege Group' })}
      rules={[{ required: true }]}
    >
      <Select
        options={rolesList}
        onChange={handleChange}
        disabled={disabled}
        placeholder={$t({ defaultMessage: 'Select Group' })}
      />
    </Form.Item>
  )
}

export default PrivilegeGroupSelector