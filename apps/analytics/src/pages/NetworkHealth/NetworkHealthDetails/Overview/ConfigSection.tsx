import React from 'react'

import _                      from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { DescriptionSection } from '@acx-ui/analytics/components'
import { formatter }          from '@acx-ui/utils'

import { authMethodsByCode } from '../../authMethods'
import { NetworkHealthTest } from '../../types'

interface Field {
  children: string | React.ReactNode
  label: string
}

type FieldFormatter = (
  details: NetworkHealthTest, $t:IntlShape['$t']
) => Field|undefined

const fieldFormatterList: FieldFormatter[] = [
  (details, $t) => ({
    children: _.get(details, 'config.wlanName') || $t({ defaultMessage: 'Unknown' }),
    label: $t({ defaultMessage: 'WLAN' })
  }),
  (details, $t) => ({
    children: _.get(details, 'config.radio')
      ? formatter('radioFormat')(details.config.radio) : $t({ defaultMessage: 'Unknown' }),
    label: $t({ defaultMessage: 'Radio Band' })
  }),
  (details, $t) => ({
    children: _.get(details, 'config.authenticationMethod')
      ? $t(authMethodsByCode[details.config.authenticationMethod].title)
      : $t({ defaultMessage: 'Unknown' }),
    label: $t({ defaultMessage: 'Authentication Method' })
  }),
  (details, $t) => {
    const auth = _.get(details, 'config.authenticationMethod')
    if(auth) {
      const field = authMethodsByCode[auth].fields.find(f => f.key === 'wlanUsername')
      if(field) return {
        children: _.get(details, 'config.wlanUsername'),
        label: $t(authMethodsByCode[auth].title)
      }
    }
    return
  },
  (details, $t) => {
    const auth = _.get(details, 'config.authenticationMethod')
    if(auth) {
      const field = authMethodsByCode[auth].fields.find(f => f.key === 'wlanPassword')
      if(field) return {
        children: '********',
        label: $t(authMethodsByCode[auth].title)
      }
    }
    return
  },
  (details, $t) => ({
    children: _.get(details, 'config.dnsServer') || $t({ defaultMessage: 'Default' }),
    label: $t({ defaultMessage: 'DNS Server' })
  }),
  (details, $t) => ({
    children: _.get(details, 'config.pingAddress') || $t({ defaultMessage: '(not set)' }),
    label: $t({ defaultMessage: 'Ping Destination Address' })
  }),
  (details, $t) => ({
    children: _.get(details, 'config.tracerouteAddress') || $t({ defaultMessage: '(not set)' }),
    label: $t({ defaultMessage: 'Traceroute Destination Address' })
  }),
  (details, $t) => ({
    children: formatter('enabledFormat')(_.get(details, 'config.speedTestEnabled')),
    label: $t({ defaultMessage: 'Speed Test' })
  })
]

export const ConfigSection: React.FC<{ details: NetworkHealthTest }> = props => {
  const { $t } = useIntl()
  const fields = fieldFormatterList
    .map(getField => getField(props.details, $t))
    .filter(Boolean) as Field[]
  return <DescriptionSection fields={fields} />
}
