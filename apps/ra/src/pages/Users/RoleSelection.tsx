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
  const raiRoles = {
    'admin': $t({ defaultMessage: 'Admin' }),
    'report-only': $t({ defaultMessage: 'Report Only' }),
    'network-admin': $t({ defaultMessage: 'Network Admin' })
  }
  return (
    <Select
      style={{ width: 350 }}
      options={Object.keys(raiRoles).map((role, i) => ({
        label: raiRoles[role as keyof typeof raiRoles],
        value: role,
        key: i
      }))}
      placeholder={$t({ defaultMessage: 'Select Role' })}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
