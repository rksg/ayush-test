import { useIntl } from 'react-intl'

export function UserGuestsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'User Guests Tab' })}
  </>
}