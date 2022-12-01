import { useIntl } from 'react-intl'

export function ClientsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'Clients Tab' })}
  </>
}