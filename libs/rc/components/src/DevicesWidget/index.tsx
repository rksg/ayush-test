import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart }    from '@acx-ui/components'
import type { DonutChartData } from '@acx-ui/components'
import { useNavigateToPath }   from '@acx-ui/react-router-dom'

export function DevicesWidget (props: {
  apData: DonutChartData[], switchData: DonutChartData[], enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onExpandClick = useNavigateToPath('/devices/')

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onExpandClick={props.enableArrowClick ? onExpandClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            <DonutChart
              style={{ width: width/2 , height }}
              title={$t({ defaultMessage: 'Wi-Fi' })}
              data={props.apData}/>
            <DonutChart
              style={{ width: width/2, height }}
              title={$t({ defaultMessage: 'Switch' })}
              data={props.switchData}/>
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
