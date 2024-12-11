import { Col, Row } from 'antd'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import { Card, Tooltip, cssStr } from '@acx-ui/components'
import { noDataDisplay }         from '@acx-ui/utils'

import * as UI              from '../../common/KPIs/styledComponents'
import { useIntentContext } from '../../IntentContext'

export const ConfigurationCard = () => {
  const { $t } = useIntl()
  const { configuration, intent, state } = useIntentContext()
  const valueFormatter = _.get(configuration, 'valueFormatter', String)
  const config = configuration!

  const values = [
    {
      key: 'currentValue',
      label: $t({ defaultMessage: 'Current' }),
      value: state === 'no-data' ? noDataDisplay : valueFormatter(intent.currentValue)
    },
    {
      key: 'recommendedValue',
      label: $t({ defaultMessage: 'Recommended' }),
      value: state === 'no-data' ? noDataDisplay : valueFormatter(intent.recommendedValue),
      tooltip: config.tooltip
    }
  ]

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
