import { useIntl } from 'react-intl'

export function ApAnalyticsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'AI Analytics' })}</>
  )
}
