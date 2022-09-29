import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart }           from '@acx-ui/components'
import type { DonutChartData }        from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

function DevicesDonutWidget (props: {
  apData: DonutChartData[], switchData: DonutChartData[]
}) {
  const basePath = useTenantLink('/devices/')
  const navigate = useNavigate()
  const { $t } = useIntl()
  const onClick = (param: string) => {
    navigate({
      ...basePath,
      // TODO Actual path to be updated later
      pathname: `${basePath.pathname}/${param}`
    })
  }

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            <DonutChart
              style={{ width: width/2 , height }}
              title={$t({ defaultMessage: 'Wi-Fi' })}
              data={props.apData}
              onClick={() => onClick('TBD')}/>
            <DonutChart
              style={{ width: width/2, height }}
              title={$t({ defaultMessage: 'Switch' })}
              data={props.switchData}
              onClick={() => onClick('TBD')}/>
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}

export default DevicesDonutWidget
