import { useIntl } from 'react-intl'

export function SwitchTimelineTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Timeline' })}</>
  )
}