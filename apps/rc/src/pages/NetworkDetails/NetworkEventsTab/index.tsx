import { useIntl } from 'react-intl'

export function NetworkEventsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Events' })}</>
  )
}
