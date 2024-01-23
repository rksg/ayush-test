/* istanbul ignore file */

import { Select }  from 'antd'
import { useIntl } from 'react-intl'

export const RoleSelection = ({
  onChange,
  selectedValue
}: {
  selectedValue?: string;
  onChange: (value: string) => void;
}) => {
  const { $t } = useIntl()
  const RaiRoles = {
    'admin': $t({ defaultMessage: 'Admin' }),
    'report-only': $t({ defaultMessage: 'Report Only' }),
    'network-admin': $t({ defaultMessage: 'Network Admin' })
  }
  return (
    <Select
      style={{ width: 300 }}
      options={Object.keys(RaiRoles).map((role, i) => ({
        label: RaiRoles[role as keyof typeof RaiRoles],
        value: role,
        key: i
      }))}
      placeholder={$t({ defaultMessage: 'Select Role' })}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
