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
}        from '@acx-ui/components'
import { useIotControllerPluginsQuery } from '@acx-ui/rc/services'
import { ActivePluginsData }            from '@acx-ui/rc/utils'
import { useParams }                    from '@acx-ui/react-router-dom'

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

  const overviewQuery = useIotControllerPluginsQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getActivePluginsData(data),
      ...rest
    })
  })

  const { data } = overviewQuery

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'Active Plugins' })}>
        {(data && data.length > 0)
          ? <Row>
            { data.map((plugin) => (
              <Col span={12} key={plugin.name}>
                <Badge
                  color='rgb(45, 183, 245)'
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
