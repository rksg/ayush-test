import { useIntl } from 'react-intl'

const SwitchFirmware = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Switch Firmware Version Management' })}</>
}

export default SwitchFirmware
