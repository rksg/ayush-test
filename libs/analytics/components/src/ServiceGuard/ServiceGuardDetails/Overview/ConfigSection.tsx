import React from 'react'

import _                                     from 'lodash'
import { IntlShape, useIntl, defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { DescriptionSection }   from '../../../DescriptionSection'
import { authMethodsByCode }    from '../../authMethods'
import { AuthenticationMethod } from '../../ServiceGuardForm/FormItems/AuthenticationMethod'
import { DnsServer }            from '../../ServiceGuardForm/FormItems/DnsServer'
import { PingAddress }          from '../../ServiceGuardForm/FormItems/PingAddress'
import { RadioBand }            from '../../ServiceGuardForm/FormItems/RadioBand'
import { SpeedTest }            from '../../ServiceGuardForm/FormItems/SpeedTest'
import { TracerouteAddress }    from '../../ServiceGuardForm/FormItems/TracerouteAddress'
import { WlanName }             from '../../ServiceGuardForm/FormItems/WlanName'
import { ServiceGuardTest }     from '../../types'

interface Field {
  children: string | React.ReactNode
  label: string
}

type FieldFormatter = (
  details: ServiceGuardTest, $t:IntlShape['$t']
) => Field|undefined

export const notSetMessage = defineMessage({ defaultMessage: '(not set)' })

const fieldFormatterList: FieldFormatter[] = [
  (details, $t) => ({
    children: _.get(details, 'config.wlanName') || $t({ defaultMessage: 'Unknown' }),
    label: $t(WlanName.label)
  }),
  (details, $t) => ({
    children: _.get(details, 'config.radio')
      ? formatter('radioFormat')(details.config.radio) : $t({ defaultMessage: 'Unknown' }),
    label: $t(RadioBand.label)
  }),
  (details, $t) => ({
    children: _.get(details, 'config.authenticationMethod')
      ? $t(authMethodsByCode[details.config.authenticationMethod].title)
      : $t({ defaultMessage: 'Unknown' }),
    label: $t(AuthenticationMethod.label)
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
    label: $t(DnsServer.label)
  }),
  (details, $t) => ({
    children: _.get(details, 'config.pingAddress') || $t(notSetMessage),
    label: $t(PingAddress.label)
  }),
  (details, $t) => ({
    children: _.get(details, 'config.tracerouteAddress') || $t(notSetMessage),
    label: $t(TracerouteAddress.label)
  }),
  (details, $t) => ({
    children: formatter('enabledFormat')(_.get(details, 'config.speedTestEnabled')),
    label: $t(SpeedTest.label)
  })
]

export const ConfigSection: React.FC<{ details: ServiceGuardTest }> = props => {
  const { $t } = useIntl()
  const fields = fieldFormatterList
    .map(getField => getField(props.details, $t))
    .filter(Boolean) as Field[]
  return <DescriptionSection fields={fields} />
}
