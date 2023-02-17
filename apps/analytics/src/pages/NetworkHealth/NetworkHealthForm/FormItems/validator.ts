import { RuleObject } from 'antd/lib/form'

import { getIntl } from '@acx-ui/utils'

function isIPv4Address (value: string) {
  const lessThan256 = '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
  const r = new RegExp(`^(${lessThan256}[.]){3}${lessThan256}$`)
  return r.test(value)
}

function isDomain (value: string) {
  const r = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
  return r.test(value)
}

export function ipValidator (rule: RuleObject, value?: string) {
  const { $t } = getIntl()
  const valid = !value || isIPv4Address(value)
  const message = $t({ defaultMessage: 'Invalid IP' })
  if (!valid) return Promise.reject(message)
  return Promise.resolve()
}

export function ipDomainValidator (rule: RuleObject, value?: string) {
  const { $t } = getIntl()
  const valid = !value || isIPv4Address(value) || isDomain(value)
  const message = $t({ defaultMessage: 'Invalid IP/Domain' })
  if (!valid) return Promise.reject(message)
  return Promise.resolve()
}

