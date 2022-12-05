import { useIntl } from 'react-intl'

export function ClientReportsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'ClientReportsTab' })}
  </>
}