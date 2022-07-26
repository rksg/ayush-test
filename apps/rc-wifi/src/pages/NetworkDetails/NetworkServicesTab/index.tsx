import { useIntl } from 'react-intl'

export function NetworkServicesTab () {
  const { $t } = useIntl()

  return (
    <>{$t({id: 'network.services.title', defaultMessage: 'Services'})}</>
  )
}
