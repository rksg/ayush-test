import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { IncidentFilter }                        from '@acx-ui/analytics/utils'
import { incidentSeverities }                    from '@acx-ui/analytics/utils'
import { Card, Loader, NoActiveData, ColorPill } from '@acx-ui/components'
import { intlFormats }                           from '@acx-ui/formatter'
import { useNavigateToPath }                     from '@acx-ui/react-router-dom'

import { useIncidentsCountBySeveritiesQuery } from './services'
import * as UI                                from './styledComponents'

const { countFormat } = intlFormats

type IncidentsCountBySeveritiesProps = {
  filters: IncidentFilter
}

export function IncidentsCountBySeverities ({ filters }: IncidentsCountBySeveritiesProps) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/analytics/incidents/')

  const response = useIncidentsCountBySeveritiesQuery(filters)
  const noData = response.data?.total === 0

  const title = {
    title: $t({ defaultMessage: 'Incidents' }),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: response.data?.total ?? 0 })}
    />
  }

  const items = response.data?.items.map(({ severity, incidentsCount, impactedClients }) => {
    const style = { borderLeftColor: `var(${incidentSeverities[severity]?.color})` }
    return <UI.Container key={severity} style={style}>
      <UI.Count>{$t(countFormat, { value: incidentsCount })}</UI.Count>
      {$t({ defaultMessage: 'Incident {severityKey}' }, { severityKey: severity })}
      <UI.ImpactedClients>
        {$t({ defaultMessage: '{impactedClients} clients impacted' },{
          impactedClients: $t(countFormat, { value: impactedClients })
        })}
      </UI.ImpactedClients>
    </UI.Container>
  })

  return <Loader states={[response]}>
    <Card title={title} onArrowClick={onArrowClick}>
      <AutoSizer>
        {({ width, height }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No reported incidents' })} />
            : <UI.Wrapper
              style={{ width, height: height - 10 - 15, marginBlock: '10px 15px' }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}
