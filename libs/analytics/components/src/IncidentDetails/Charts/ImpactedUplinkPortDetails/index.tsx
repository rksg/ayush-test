import { useIntl } from 'react-intl'

import { overlapsRollup } from '@acx-ui/analytics/utils'
import { Loader }         from '@acx-ui/components'

import DetailsCard from '../ImpactedSwitchVLANDetails/DetailsCard'

import { useImpactedSwitchesQuery, ImpactedSwitchPort } from './services'

import type { ChartProps } from '../types.d'

export function ImpactedUplinkPortDetails ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id, switchCount } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesQuery({ id: 'fd4c8899-55ba-4a04-98e4-c5b73ce1bc81' },
    { skip: druidRolledup,
      selectFromResult: (response) => {
        const impactedPorts: ImpactedSwitchPort[] = []

        const rows = response.data?.impactedSwitches.map(({ name, mac, ports }) => {
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
      title: $t({ defaultMessage: 'Impacted switches' }),
      // eslint-disable-next-line max-len
      details: $t({ defaultMessage: 'Out of {switchCount} {switchCount, plural, one {switch} other {switches}}' }, { switchCount })
    },
    {
      icon: 'port',
      max: 3,
      count: impactedUplinkPorts?.length,
      data: [],
      title: $t({ defaultMessage: 'Impacted uplink ports' }),
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


