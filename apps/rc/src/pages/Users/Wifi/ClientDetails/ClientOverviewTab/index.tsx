import { useIntl } from 'react-intl'

export function ClientOverviewTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'ClientOverviewTab' })}
  </>
}