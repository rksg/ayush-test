import { useIntl } from 'react-intl'

export function ClientTimelineTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'ClientTimelineTab' })}
  </>
}