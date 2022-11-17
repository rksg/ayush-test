import { useIntl } from 'react-intl'

export function UserClientsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'User Clients Tab' })}
  </>
}