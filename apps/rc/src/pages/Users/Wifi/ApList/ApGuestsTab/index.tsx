import { useIntl } from 'react-intl'

export function ApGuestsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'Ap Guests Tab' })}
  </>
}