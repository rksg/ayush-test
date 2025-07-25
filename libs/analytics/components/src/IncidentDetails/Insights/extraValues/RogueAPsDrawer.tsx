import { useMemo, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Incident, aggregateDataBy } from '@acx-ui/analytics/utils'
import { Drawer, Loader, Table }     from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { formatter }                 from '@acx-ui/formatter'
import { TenantLink }                from '@acx-ui/react-router-dom'
import type { TableColumn }          from '@acx-ui/types'

import { column }            from '../../IncidentAttributes/ImpactedDrawer'
import { DrawerTextContent } from '../styledComponents'

import { RogueAP, useRogueAPsQuery } from './services'

export interface AggregatedRogueAP {
  rogueApMac: RogueAP['rogueApMac'][]
  rogueSSID: RogueAP['rogueSSID'][]
  rogueType: RogueAP['rogueType'][]
  maxRogueSNR: string[]
  apName: RogueAP['apName'][]
  apMac: RogueAP['apMac'][]
}

export interface ImpactedDrawerProps extends
  Pick<Incident, 'id' | 'impactedStart' | 'impactedEnd'> {
  visible: boolean
  onClose: () => void
}

export const RogueAPsDrawer: React.FC<ImpactedDrawerProps> = (props) => {
  const { $t, formatList } = useIntl()
  const [ search, setSearch ] = useState('')
  const queryResults = useRogueAPsQuery({
    id: props.id,
    search,
    n: 100,
    impactedStart: props.impactedStart,
    impactedEnd: props.impactedEnd
  },{ selectFromResult: (states) => ({
    ...states,
    data: {
      ...states.data,
      aggregatedRogueAP: aggregateDataBy<RogueAP & { maxRogueSNR: string }>(
        row => JSON.stringify(_.pick(row, ['rogueApMac', 'apMac']))
      )(_.get(states, 'data.rogueAPs', []).map(
        (row: RogueAP) => ({ ...row, maxRogueSNR: formatter('decibelFormat')(row.maxRogueSNR) }))
      )
    }
  }) })

  const columns = useMemo(() => [
    column('rogueApMac', {
      title: $t({ defaultMessage: 'Rogue AP MAC' }),
      searchable: true
    }),
    column('rogueSSID', {
      title: $t({ defaultMessage: 'Rogue SSID' }),
      searchable: true
    }),
    column('rogueType', {
      title: $t({ defaultMessage: 'Rogue Type' }),
      searchable: true
    }),
    column('maxRogueSNR', { title: $t({ defaultMessage: 'Max Rogue SNR' }) }),
    column('apName', {
      title: $t({ defaultMessage: 'Detected by AP Name' }),
      searchable: true,
      render: (_, { apName, apMac }, __, highlightFn) =>
        <TenantLink
          to={`devices/wifi/${apMac}/details/${get('IS_MLISA_SA') ? 'ai': 'overview'}`}
          title={formatList(apName, { style: 'narrow', type: 'conjunction' })}
        >{highlightFn($t(
            {
              defaultMessage: '{name}{count, plural, one {} other { ({count})}}',
              description: 'Translation strings - nil)'
            },
            { name: apName[0], count: apName.length }
          ))}
        </TenantLink>,
      width: 160
    }),
    column('apMac', {
      searchable: true,
      title: $t({ defaultMessage: 'Detected by AP MAC' }),
      width: 160
    })
  ] as TableColumn<AggregatedRogueAP>[], [$t, formatList])

  return <Drawer
    width={'900px'}
    title={$t(
      {
        defaultMessage: '{count} Rogue {count, plural, one {AP} other {APs}}',
        description: 'Translation strings - Rogue, AP, APs)'
      },
      { count: queryResults.data.rogueAPCount }
    )}
    visible={props.visible}
    onClose={props.onClose}
    children={<Loader states={[queryResults]}>
      <Table<AggregatedRogueAP>
        rowKey={(row: AggregatedRogueAP) => `${row.rogueApMac}-${row.apMac}`}
        columns={columns}
        searchableWidth={680}
        onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
        enableApiFilter
        dataSource={queryResults.data.aggregatedRogueAP}/>
    </Loader>}
  />
}

export const RogueAPsDrawerLink = (
  { incident, children }: { incident: Incident, children: React.ReactNode }
) => {
  const [visible, setVisible] = useState<boolean>(false)
  return <>
    <DrawerTextContent onClick={() => setVisible(true)}>{children}</DrawerTextContent>
    <RogueAPsDrawer
      visible={visible}
      onClose={() => setVisible(false)}
      id={incident.id}
      impactedStart={incident.impactedStart}
      impactedEnd={incident.impactedEnd}/>
  </>
}
