import { getIntl } from '@acx-ui/utils'

export const getIpSecIkeAlgorithmOptions = () => {
  const { $t } = getIntl()

  return [{
    value: 'AES128-SHA1-MODP2048',
    label: $t({ defaultMessage: 'AE128-SHA1-MODP2048' })
  }, {
    value: 'AES256-SHA384-ECP384',
    label: $t({ defaultMessage: 'AES256-SHA384-ECP384' })
  }]
}

export const getIpSecEspAlgorithmOptions = () => {
  const { $t } = getIntl()

  return [{
    value: 'AES128-SHA1-MODP2048',
    label: $t({ defaultMessage: 'AE128-SHA1-MODP2048' })
  }, {
    value: 'AES256-SHA384-ECP384',
    label: $t({ defaultMessage: 'AES256-SHA384-ECP384' })
  }]
}