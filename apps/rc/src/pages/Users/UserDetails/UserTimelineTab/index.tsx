import { useIntl } from 'react-intl'

export function UserTimelineTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'UserTimelineTab' })}
  </>
}