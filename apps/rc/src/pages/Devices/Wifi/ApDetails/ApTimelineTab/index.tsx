import { useIntl } from 'react-intl'

export function ApTimelineTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Timeline' })}</>
  )
}
