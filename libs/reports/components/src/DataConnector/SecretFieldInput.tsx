import { Input, InputProps } from 'antd'
import { TextAreaProps }     from 'antd/lib/input'
import { useIntl }           from 'react-intl'

import { getIntl } from '@acx-ui/utils'

const SecretFieldInput = ({
  hasPlaceholder,
  ...props
}: InputProps & { hasPlaceholder: boolean }
) => {
  const { $t } = useIntl()
  return (
    <Input.Password
      {...props}
      placeholder={
        hasPlaceholder
          ? $t({ defaultMessage: 'Leave blank to remain unchanged' })
          : undefined
      }
    />
  )
}

SecretFieldInput.TextArea = ({
  hasPlaceholder,
  ...props
}: TextAreaProps & { hasPlaceholder: boolean }) => {
  const { $t } = getIntl()
  return (
    <Input.TextArea
      {...props}
      placeholder={
        hasPlaceholder
          ? $t({ defaultMessage: 'Leave blank to remain unchanged' })
          : undefined
      }
    />
  )
}

export default SecretFieldInput
