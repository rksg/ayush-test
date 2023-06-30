import { EdgeDhcpOption, EdgeDhcpOptionsEnum, networkWifiIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                              from '@acx-ui/utils'

export const optionValueValidator = (optionType: EdgeDhcpOptionsEnum) => {
  switch(optionType) {
    case EdgeDhcpOptionsEnum.DOMAIN_SERVER:
    case EdgeDhcpOptionsEnum.NTP_SERVERS:
      return arrayOfIpValidator
    case EdgeDhcpOptionsEnum.VENDOR_ENCAPSULATED_OPTIONS:
      return vendorEncapsulatedValidator
    default:
      return () => Promise.resolve()
  }
}

export const duplicateOptionValidator = async (
  value: string,
  dhcpHosts: EdgeDhcpOption[] = [],
  currentId: EdgeDhcpOption['id']
) => {
  const { $t } = getIntl()
  const matched = dhcpHosts.find((item) => item.optionId === value && currentId !== item.id)
  if (!matched) return

  return Promise.reject($t(validationMessages.duplication, {
    entityName: $t({ defaultMessage: 'Option Name' }),
    key: $t({ defaultMessage: 'name' }),
    extra: ''
  }))
}

const arrayOfIpValidator = async (value: string) => {
  if(!value) return
  const { $t } = getIntl()
  const ipArr = value.split(',')
  for(let ip of ipArr) {
    try{
      await networkWifiIpRegExp(ip.trim())
    } catch(err) {
      return Promise.reject($t({
        defaultMessage: 'Please enter a list of IP addresses, separated by commas'
      }))
    }
  }
  return Promise.resolve()
}

const vendorEncapsulatedValidator = async (value: string) => {
  if(!value) return
  const { $t } = getIntl()
  const hexRegex = new RegExp(/^[0-9a-fA-F]+$/)
  if (!hexRegex.test(value) || value.trim().length % 2 !== 0) {
    return Promise.reject($t({
      defaultMessage: 'Please enter an even-length hexadecimal value'
    }))
  }
  return Promise.resolve()
}