import { useIntl } from 'react-intl'

export function ExternalAntenna () {
  const { $t } = useIntl()
  return (
    <>
      {$t({ defaultMessage: 'External Antenna Component' })}
    </>
  )
}