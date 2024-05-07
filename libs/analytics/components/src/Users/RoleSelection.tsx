/* istanbul ignore file */

import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { useRoles } from '@acx-ui/analytics/utils'

export const RoleSelection = ({
  onChange,
  selectedValue
}: {
  selectedValue?: string;
  onChange: (value: string) => void;
}) => {
  const { $t } = useIntl()
  const roles = useRoles(false)
  return (
    <Select
      style={{ width: 350 }}
      options={Object.entries(roles).map(([role, label]) => ({
        label: $t(label),
        value: role,
        key: role
      }))}
      placeholder={$t({ defaultMessage: 'Select a role' })}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
