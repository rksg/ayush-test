import _           from 'lodash'
import { useIntl } from 'react-intl'

import { overlapsRollup } from '@acx-ui/analytics/utils'
import { Loader }         from '@acx-ui/components'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchVLANsQuery
} from '../ImpactedSwitchVLANsTable/services'

import DetailsCard from './DetailsCard'

import type { ChartProps } from '../types.d'

interface ImpactedVlans {
  id: number
  mac: string
  name: string
}

export function concatMismatchedVlans (item: ImpactedSwitchPortRow) {
  const vlans = item.mismatchedVlans
    .concat(item.mismatchedUntaggedVlan || [])
  return {
    ...item,
    mismatchedVlans: _.uniqBy(vlans, 'id').sort((a, b) => a.id - b.id)
  }
}

export function ImpactedSwitchVLANsDetails ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id, switchCount, vlanCount } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchVLANsQuery({ id },
    { skip: druidRolledup, selectFromResult: (response) => {
      const rows = response.data?.map(concatMismatchedVlans)
      return { ...response, rows }
    } })

  const impactedSwitcheVLANs = response.data!

  const removeDuplicateMismatchVLANs = (impactedSwitches: ImpactedSwitchPortRow[]) =>
    _.isEmpty(impactedSwitches)
      ? []
      : _.uniqBy(impactedSwitches, (item) =>
        item.mismatchedVlans ? item.mismatchedVlans[0]?.id : [])

  const impactedVlans: ImpactedVlans[] = removeDuplicateMismatchVLANs(impactedSwitcheVLANs)
    ?.flatMap(({ mac, mismatchedVlans }) => mismatchedVlans
      .map(({ id, name }) => ({ mac, id, name }))
    )

  const uniqImpactedVlans = _.sortBy(
    Object.entries(impactedVlans.reduce((agg, { mac, id, name }) => {
      agg[id] = {
        macs: agg[id] ? [...new Set([...agg[id].macs, mac])] : [mac],
        names: agg[id] ? [...new Set([...agg[id].names, name])] : [name]
      }
      return agg
    }, {} as Record<number, { macs: string[]; names: string[] }>)), ([id]) => parseInt(id, 10))

  const uniqueSwitchs = _.uniqBy(
    impactedSwitcheVLANs?.map(({ name, mac: title }) => ({ name, title })), 'title')
  const uniqueVlanCount = !_.isEmpty(uniqImpactedVlans)
    ? _.flatMap(uniqImpactedVlans, ([, { macs }]) => macs).length : 0
  const impactedTypes = [
    {
      icon: 'switch',
      max: 3,
      count: uniqueSwitchs.length,
      data: uniqueSwitchs,
      title: $t({ defaultMessage: 'Impacted switches' }),
      // eslint-disable-next-line max-len
      details: $t({ defaultMessage: 'Out of {switchCount} {switchCount, plural, one {switch} other {switches}}' }, { switchCount })
    },
    {
      icon: 'vlan',
      max: 3,
      count: uniqueVlanCount,
      data: uniqImpactedVlans.map(([id, { macs, names }]) => {
        const macsCount = macs.length
        return {
          name: macs.length > 1
            ? $t({ defaultMessage: 'VLAN {id} ({macsCount} switches)' }, { id, macsCount })
            : $t({ defaultMessage: 'VLAN {id}' }, { id }),
          title: names.join(',')
        }
      }),
      title: $t({ defaultMessage: 'Mismatched VLAN' }),
      details: $t({ defaultMessage:
        '{vlanCount} configured {vlanCount, plural, one {VLAN} other {VLANs}}' }, { vlanCount })
    }
  ]

  return <Loader states={[response]}>
    <DetailsCard
      druidRolledup={druidRolledup}
      isImpactedSwitches={impactedSwitcheVLANs?.length > 0}
      impactedTypes={impactedTypes}
    />
  </Loader>
}
