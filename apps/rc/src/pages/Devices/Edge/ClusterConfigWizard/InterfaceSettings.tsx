import { useIntl } from 'react-intl'

export const InterfaceSettings = () => {
  const { $t } = useIntl()
  return <div>{$t({ defaultMessage: 'LAG, Port & Virtual IP Settings' })}</div>
}