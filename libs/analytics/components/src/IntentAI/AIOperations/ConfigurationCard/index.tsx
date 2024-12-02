import { Col, Row } from 'antd'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import { Card, Tooltip, cssStr } from '@acx-ui/components'
import { noDataDisplay }         from '@acx-ui/utils'

import * as UI              from '../../common/KpiCard/styledComponents'
import { useIntentContext } from '../../IntentContext'

export const ConfigurationCard = () => {
  const { $t } = useIntl()
  const { configuration, intent, state } = useIntentContext()
  const valueFormatter = _.get(configuration, 'valueFormatter', String)
  const config = configuration!
  const isPausedOrNa = intent.status === 'paused' || intent.status === 'na'

  const values = isPausedOrNa ? [
    {
      key: 'currentValue',
      label: $t({ defaultMessage: 'Current' }),
      value: intent.currentValue === null
        ? $t({ defaultMessage: 'Not available' })
        : valueFormatter(intent.currentValue)
    }]
    : [{
      key: 'currentValue',
      label: $t({ defaultMessage: 'Current' }),
      value: state === 'no-data' ? noDataDisplay : valueFormatter(intent.currentValue)
    }, {
      key: 'recommendedValue',
      label: $t({ defaultMessage: 'Recommended' }),
      value: state === 'no-data' ? noDataDisplay : valueFormatter(intent.recommendedValue),
      tooltip: config.tooltip
    }]

  return <Card>
    <UI.Title>{$t(config.label)}</UI.Title>
    <Row>
      {values.map(({ key, label, value, tooltip })=>
        <Col key={key} span={12}>
          <UI.Statistic
            title={label}
            value={value}
            suffix={tooltip &&
              <Tooltip.Info isFilled
                title={$t(tooltip(intent))}
                iconStyle={{ color: cssStr('--acx-neutrals-50') }}
              />
            }
          />
        </Col>)}
    </Row>
  </Card>
}
