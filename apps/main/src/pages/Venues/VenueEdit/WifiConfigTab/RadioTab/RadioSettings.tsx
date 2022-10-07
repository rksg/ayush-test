import { useIntl } from 'react-intl'

export function RadioSettings () {
  const { $t } = useIntl()
  return (
    <>
      {$t({ defaultMessage: 'Radio Settings Component' })}
    </>
  )
}