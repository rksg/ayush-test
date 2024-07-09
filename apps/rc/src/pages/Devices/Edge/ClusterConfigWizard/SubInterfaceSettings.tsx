import { useIntl } from 'react-intl'

export const SubInterfaceSettings = () => {
  const { $t } = useIntl()
  return <div>{$t({ defaultMessage: 'Sub-interface Settings' })}</div>
}