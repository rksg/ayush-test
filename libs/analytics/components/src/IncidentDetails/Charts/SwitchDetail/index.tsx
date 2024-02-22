import { get }                                       from 'lodash'
import moment                                        from 'moment-timezone'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Card, Loader, ProgressPill, Tooltip } from '@acx-ui/components'
import { DateFormatEnum, formatter }           from '@acx-ui/formatter'
import { noDataDisplay }                       from '@acx-ui/utils'

import switchImg      from '../../../../../assets/switch.png'
import { ChartProps } from '../types'

import { useImpactedSwitchesQuery, useMemoryUtilizationQuery } from './services'
import { DetailsContainer, Image, Statistic }                  from './styledComponents'

export function SwitchDetail ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const impactedSwitches = useImpactedSwitchesQuery({ id: incident.id, n: 100, search: '' })
  const memoryUtilization = useMemoryUtilizationQuery({
    start: moment(incident.endTime).subtract(10, 'second').toISOString(),
    end: moment(incident.endTime).toISOString(),
    path: incident.path
  })

  const fields: {
    key: string
    title: MessageDescriptor
    Component?: ({ value }: { value: number }) => JSX.Element
    valueFormatter?: (value: number) => string
    infoFormatter?: (value: string) => string
  }[] = [
    { key: 'name', title: defineMessage({ defaultMessage: 'Switch Name' }) },
    { key: 'model', title: defineMessage({ defaultMessage: 'Switch Model' }) },
    { key: 'mac', title: defineMessage({ defaultMessage: 'Switch Mac' }) },
    { key: 'firmware', title: defineMessage({ defaultMessage: 'Switch Firmware Version' }) },
    { key: 'utilization',
      title: defineMessage({ defaultMessage: 'Memory Utilization' }),
      Component: ({ value }: { value: number }) => <ProgressPill percent={value * 100}/>,
      infoFormatter: (info: string) =>
        info && $t(
          { defaultMessage: 'At {time}' },
          { time: formatter(DateFormatEnum.DateTimeFormat)(info) }
        )
    },
    { key: 'apCount',
      title: defineMessage({ defaultMessage: 'Number of APs' }),
      valueFormatter: (value: number) => value > 0 ? formatter('countFormat')(value) : noDataDisplay
    }
  ]

  const data = {
    ...impactedSwitches.data,
    utilization: {
      info: get(memoryUtilization.data, 'memoryTime'),
      value: get(memoryUtilization.data, 'memoryValue')
    },
    apCount: incident.apCount
  }

  return <Loader states={[impactedSwitches, memoryUtilization]}>
    <Card title={$t({ defaultMessage: 'Details' })} type='no-border'>
      <DetailsContainer>
        <Image src={switchImg} alt={$t({ defaultMessage: 'switch image' })} />
        {fields.map(({ key, title, Component, valueFormatter, infoFormatter })=>{
          const { value, info = undefined } = get(data, `${key}.value`)
            ? get(data, key) : { value: get(data, key) }
          return <Statistic
            key={key}
            title={<>{$t(title)}{info && <Tooltip.Info title={infoFormatter?.(info)}/>}</>}
            prefix={Component && <Component value={value} />}
            value={Component
              ? undefined
              : (valueFormatter ? valueFormatter(value): (value || noDataDisplay))}
          />
        })}
      </DetailsContainer>
    </Card>
  </Loader>
}
