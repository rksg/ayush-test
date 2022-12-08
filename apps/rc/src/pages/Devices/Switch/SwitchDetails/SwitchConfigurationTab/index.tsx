import { useIntl } from 'react-intl'

export function SwitchConfigurationTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Configuration' })}</>
  )
}