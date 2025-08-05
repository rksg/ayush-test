import { IpSecRekeyTimeUnitEnum } from '@acx-ui/rc/utils'
import { getIntl }                from '@acx-ui/utils'

export  const getRekeyTimeUnitOptions = () => {
  const { $t } = getIntl()

  return [
    { label: $t({ defaultMessage: 'Day(s)' }), value: IpSecRekeyTimeUnitEnum.DAY },
    { label: $t({ defaultMessage: 'Hour(s)' }), value: IpSecRekeyTimeUnitEnum.HOUR },
    { label: $t({ defaultMessage: 'Minute(s)' }), value: IpSecRekeyTimeUnitEnum.MINUTE }
  ]
}