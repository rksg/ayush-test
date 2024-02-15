import {
  Form,
  Select
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetPrivilegeGroupsQuery } from '@acx-ui/rc/services'

export interface PrivilegeGroupSelectorProps {
      disabled?: boolean;
    }

const PrivilegeGroupSelector = (props: PrivilegeGroupSelectorProps) => {
  const { $t } = useIntl()
  const { disabled } = props
  const params = useParams()
  const { data: roleList } = useGetPrivilegeGroupsQuery({ params })

  const rolesList = roleList?.map((item) => ({
    label: item.name,
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