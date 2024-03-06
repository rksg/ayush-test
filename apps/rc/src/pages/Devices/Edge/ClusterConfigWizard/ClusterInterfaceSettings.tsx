import { useIntl } from 'react-intl'

export const ClusterInterfaceSettings = () => {
  const { $t } = useIntl()
  return <div>{$t({ defaultMessage: 'Cluster Interface Settings' })}</div>
}