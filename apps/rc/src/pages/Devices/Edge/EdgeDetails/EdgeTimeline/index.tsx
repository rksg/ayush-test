import { useIntl } from 'react-intl'

export function EdgeTimeline () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Timeline' })}</>
  )
}