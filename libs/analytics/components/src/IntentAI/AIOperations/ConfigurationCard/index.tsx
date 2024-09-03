import { Col, Row }               from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Card, Tooltip, cssStr } from '@acx-ui/components'

import { IntentConfigurationConfig } from '../../IntentContext'
import { Statuses }                  from '../../states'
import { Intent }                    from '../../useIntentDetailsQuery'

import * as UI from './styledComponents'


const BLURREDVALUE = '1.23.45.6'
const BLURREDLABEL = 'Recommend'

export const ConfigurationCard: React.FC<{
  configuration: IntentConfigurationConfig,
  intent: Intent
}> = ({ configuration, intent }) => {
  const { $t } = useIntl()
  const blurData = [
    Statuses.na,
    Statuses.paused
  ].includes(intent.status as Statuses)
  const values = [
    {
      key: 'currentValue',
      label: defineMessage({ defaultMessage: 'Current' })
    },
    {
      key: 'recommendedValue',
      label: defineMessage({ defaultMessage: 'Recommended' }),
      tooltip: configuration?.tooltip
    }
  ]

  return <Card>
    <UI.Title>{$t(configuration.label)}</UI.Title>
    <Row>
      {values.map(({ key, label, tooltip })=>
        <Col key={key} span={12}>
          <UI.Statistic
            title={blurData ? BLURREDLABEL : $t(label)}
            value={blurData
              ? BLURREDVALUE
              : configuration.valueFormatter?.(intent[key as keyof Intent])}
            suffix={tooltip &&
              <Tooltip.Info isFilled
                title={$t(tooltip(intent))}
                iconStyle={{ color: cssStr('--acx-neutrals-50') }}
              />
            }
            style={{
              filter: blurData ? 'blur(8px)' : 'none'
            }}
          />
        </Col>)}
    </Row>
  </Card>
}
