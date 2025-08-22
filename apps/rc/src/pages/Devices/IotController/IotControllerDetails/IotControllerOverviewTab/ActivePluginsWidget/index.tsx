import {
  Badge,
  Col,
  Row
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  NoActiveData,
  Card
} from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { useIotControllerPluginsQuery } from '@acx-ui/rc/services'
import {
  ActivePluginsData,
  ActivePluginsDataV2
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

// eslint-disable-next-line max-len
export const getActivePluginsData = (overviewData?: ActivePluginsData) => {
  // eslint-disable-next-line max-len
  if (overviewData && overviewData.pluginStatus) {
    return overviewData.pluginStatus
  } else {
    return []
  }
}

export function ActivePluginsWidget () {
  const { $t } = useIntl()
  const isIotDashboardApi = useIsSplitOn(Features.IOT_DASHBOARD_API)

  const overviewQuery = useIotControllerPluginsQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      // eslint-disable-next-line max-len
      data: getActivePluginsData((isIotDashboardApi && (data as ActivePluginsDataV2)?.ok) ? { pluginStatus: (data as ActivePluginsDataV2).data } : (data as ActivePluginsData)),
      ...rest
    })
  })

  const { data } = overviewQuery

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'Active Plugins' })}>
        {(data && data.length > 0)
          ? <Row style={{ paddingLeft: '22px' }}>
            { data.map((plugin) => (
              <Col span={12} key={plugin.name}>
                <Badge
                  // eslint-disable-next-line max-len
                  color={plugin.running ? 'var(--acx-semantics-green-50)' : 'var(--acx-neutrals-50)'}
                  text={plugin.name}
                />
              </Col>
            ))}
          </Row>
          : <NoActiveData text={$t({ defaultMessage: 'No Active Plugins' })}/>
        }
      </Card>
    </Loader>
  )
}
