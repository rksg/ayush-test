import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Card, Loader } from '@acx-ui/components'
import {
  Switch,
  VLANIcon
} from '@acx-ui/icons'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchVLANsQuery
} from '../ImpactedSwitchVLANsTable/services'

import * as UI from './styledComponents'

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
  const response = useImpactedSwitchVLANsQuery({ id }, { selectFromResult: (response) => {
    const rows = response.data?.map(concatMismatchedVlans)
    return { ...response, rows }
  } })

  const impactedSwitches = response.data!

  const removeDuplicateMismatchVLANs = (impactedSwitches: ImpactedSwitchPortRow[]) =>
    _.isEmpty(impactedSwitches)
      ? []
      : _.uniqBy(impactedSwitches, (item) => item.mismatchedVlans[0].id)

  const impactedVlans: ImpactedVlans[] = removeDuplicateMismatchVLANs(impactedSwitches)
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

  const uniqueSwitchCount = impactedSwitches?.length || 0
  const uniqueVlanCount = !_.isEmpty(uniqImpactedVlans)
    ? _.flatMap(uniqImpactedVlans, ([, { macs }]) => macs).length : 0
  const impactedTypes = [
    {
      icon: 'switch',
      max: 3,
      count: uniqueSwitchCount,
      data: impactedSwitches?.map(({ name, mac: title }) => ({ name, title })),
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
    <Card title={$t({ defaultMessage: 'Details' })} type='no-border'>
      <UI.SummaryWrapper>
        {impactedSwitches && impactedTypes.map((type, index) => {
          const items = type.data.slice(0, type.max)
          const remaining = type.data.length - items?.length
          return <UI.SummaryType key={index}>
            <UI.Summary>
              <UI.SummaryCount>{type.count}</UI.SummaryCount>
              <UI.SummaryTitle>{type.title}</UI.SummaryTitle>
              <UI.SummaryDetails>{type.details}</UI.SummaryDetails>
            </UI.Summary>
            <UI.SummaryList>
              {items.map((d, i) => <div key={i} title={d.title}>
                {type.icon === 'vlan' ? <VLANIcon /> : <Switch />}
                <span>{d.name}</span>
              </div>)}
              {remaining > 0 && <span>
                {$t({ defaultMessage: 'and {remaining} more…' }, { remaining } )}
              </span>}
            </UI.SummaryList>
          </UI.SummaryType>
        })}
      </UI.SummaryWrapper>
    </Card>
  </Loader>
}
