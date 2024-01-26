/* istanbul ignore file */

import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { messages } from './'
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
      style={{ width: 300 }}
      options={['admin','report-only','network-admin' ].map((role, i) => ({
        label: $t(messages[role as keyof typeof messages]),
        value: role,
        key: i
      }))}
      placeholder={$t({ defaultMessage: 'Select Role' })}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
