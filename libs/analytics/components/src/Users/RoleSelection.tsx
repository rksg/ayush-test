/* istanbul ignore file */

import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { RolesEnum, roleStringMap } from '@acx-ui/analytics/utils'

export const RoleSelection = ({
  onChange,
  selectedValue
}: {
  selectedValue?: string;
  onChange: (value: string) => void;
}) => {
  const { $t } = useIntl()
  return (
    <Select
      style={{ width: 350 }}
      options={Object.values(RolesEnum).map((role, i) => ({
        label: $t(roleStringMap[role]),
        value: role,
        key: i
      }))}
      placeholder={$t({ defaultMessage: 'Select a role' })}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
