import { Button, Space } from 'antd'
import { useIntl }       from 'react-intl'

import { Select } from '@acx-ui/components'

export const IpsecProfileSelector = (props: {
  value?: string  // provided by form
  onChange?: (value: string) => void // provided by form
  options: { label: string, value: string }[]
  isLoading: boolean
  disabled: boolean
  handleAddIpsecProfile: () => void
}) => {
  const { $t } = useIntl()
  const {
    value, onChange,
    options, isLoading, disabled,
    handleAddIpsecProfile } = props

  return <Space>
    <Select
      style={{ width: 200 }}
      value={value}
      onChange={onChange}
      options={options}
      loading={isLoading}
      disabled={disabled}
    />
    <Button
      type='link'
      onClick={handleAddIpsecProfile}
      disabled={disabled}
    >
      {$t({ defaultMessage: 'Add' })}
    </Button>
  </Space>
}