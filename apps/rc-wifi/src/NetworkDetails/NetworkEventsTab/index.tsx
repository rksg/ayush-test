import { useIntl } from 'react-intl'

export function NetworkEventsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({id: 'network.events.title', defaultMessage: 'Events'})}</>
  )
}
