import { useIntl } from 'react-intl'

const FWVersionMgmt = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Firmware Version Management' })}</>
}

export default FWVersionMgmt