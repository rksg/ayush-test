import { get }                                       from 'lodash'
import moment                                        from 'moment-timezone'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Loader, ProgressPill }      from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { ChartProps } from '../types'

import { DetailsCard }                                       from './DetailsCard'
import { useImpactedSwitchQuery, useMemoryUtilizationQuery } from './services'

export function SwitchDetail ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const impactedSwitch = useImpactedSwitchQuery({ id: incident.id, n: 100, search: '' })
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
    { key: 'mac', title: defineMessage({ defaultMessage: 'Switch MAC' }) },
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
      valueFormatter: (value: number) => formatter('countFormat')(value)
    }
  ]

  const data = {
    ...impactedSwitch.data,
    utilization: {
      info: get(memoryUtilization.data, 'memoryTime'),
      value: get(memoryUtilization.data, 'memoryValue')
    },
    apCount: incident.apCount
  }

  return <Loader states={[impactedSwitch, memoryUtilization]}>
    <DetailsCard fields={fields} data={data} impactedSwitch={impactedSwitch} />
  </Loader>
}
