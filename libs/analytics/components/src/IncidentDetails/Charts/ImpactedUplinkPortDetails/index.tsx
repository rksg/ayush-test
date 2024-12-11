import { useIntl } from 'react-intl'

import { overlapsRollup } from '@acx-ui/analytics/utils'
import { Loader }         from '@acx-ui/components'

import { useImpactedSwitchesUplinkQuery, ImpactedSwitchPort } from '../ImpactedSwitchUplinkTable/services'
import DetailsCard                                            from '../ImpactedSwitchVLANDetails/DetailsCard'

import type { ChartProps } from '../types.d'

export function ImpactedUplinkPortDetails ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id, switchCount } = incident
  const druidRolledup = overlapsRollup(incident.endTime)
  const response = useImpactedSwitchesUplinkQuery({ id },
    { skip: druidRolledup,
      selectFromResult: (response) => {
        const impactedPorts: ImpactedSwitchPort[] = []

        const rows = response.data?.impactedSwitches?.map(({ name, mac, ports }) => {
          impactedPorts.push(...ports)
          return { name, mac }
        })
        return {
          ...response,
          data: {
            uplinkPortCount: response.data?.uplinkPortCount || 0,
            impactedSwitches: rows,
            impactedPorts
          }
        }
      } })

  const {
    impactedSwitches = [], impactedPorts: impactedUplinkPorts, uplinkPortCount
  } = response.data

  const impactedTypes = [
    {
      icon: 'switch',
      max: 3,
      count: impactedSwitches?.length,
      data: impactedSwitches.map(({ name, mac: title }) => ({ name, title })),
      // eslint-disable-next-line max-len
      title: $t({ defaultMessage: 'Impacted {switchCount, plural, one {switch} other {switches}}' }, { switchCount }),
      // eslint-disable-next-line max-len
      details: $t({ defaultMessage: 'Out of {switchCount} {switchCount, plural, one {switch} other {switches}}' }, { switchCount })
    },
    {
      icon: 'port',
      max: 3,
      count: impactedUplinkPorts?.length,
      data: [],
      title: $t({ defaultMessage: 'Impacted uplink {portCount, plural, one {port} other {ports}}' },
        { portCount: uplinkPortCount }),
      details: $t({ defaultMessage:
        'Out of {portCount} uplink {portCount, plural, one {port} other {ports}}' },
      { portCount: uplinkPortCount })
    }
  ]

  return <Loader states={[response]}>
    <DetailsCard
      druidRolledup={druidRolledup}
      isImpactedSwitches={Boolean(impactedSwitches?.length)}
      impactedTypes={impactedTypes}
    />
  </Loader>
}


