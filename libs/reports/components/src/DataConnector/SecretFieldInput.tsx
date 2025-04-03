import { Input, InputProps } from 'antd'
import { TextAreaProps }     from 'antd/lib/input'
import { useIntl }           from 'react-intl'

import { getIntl } from '@acx-ui/utils'

const placeholder = 'Leave blank to remain unchanged'

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
        hasPlaceholder ? $t({ defaultMessage: placeholder }) : undefined
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
        hasPlaceholder ? $t({ defaultMessage: placeholder }) : undefined
      }
    />
  )
}

export default SecretFieldInput
