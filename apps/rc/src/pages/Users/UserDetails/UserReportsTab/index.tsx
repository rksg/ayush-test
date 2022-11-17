import { useIntl } from 'react-intl'

export function UserReportsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'UserReportsTab' })}
  </>
}