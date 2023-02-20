import { useIntl } from 'react-intl'

export const EdgeServices = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Services' })}</>
}