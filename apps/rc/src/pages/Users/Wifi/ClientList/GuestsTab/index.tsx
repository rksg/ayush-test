import { useIntl } from 'react-intl'

export function GuestsTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'Guests Tab' })}
  </>
}