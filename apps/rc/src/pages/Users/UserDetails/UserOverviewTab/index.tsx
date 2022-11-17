import { useIntl } from 'react-intl'

export function UserOverviewTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'UserOverviewTab' })}
  </>
}