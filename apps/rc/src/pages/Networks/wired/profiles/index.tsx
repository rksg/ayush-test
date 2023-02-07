import { useIntl } from 'react-intl'

export function ProfilesTab () {
  const { $t } = useIntl()

  return (
    <>{$t({ defaultMessage: 'Configuration Profiles Tab' })}</>
  )
}
