import { useState } from 'react'

import { Row, Col }               from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { NetworkFilter, Button } from '@acx-ui/components'
import { useParams }             from '@acx-ui/react-router-dom'
import { useEncodedParameter }   from '@acx-ui/utils'

import { ClientTroubleShootingConfig } from './config'
import { History }                     from './EventsHistory'
import { TimeLine }                    from './EventsTimeline'

type ClientTroubleShootingSelectionsType = {
  category?: [];
  type?: [];
  radio?: [];
}
type SingleValueType = (string | number)[]
type selectionType = SingleValueType | SingleValueType[] | undefined
export function ClientTroubleshooting ({ clientMac } : { clientMac: string }) {
  // Todo use clientId to get timeline and history
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.log(clientMac)
  const { userId: clientId } = useParams()
  const [historyContentToggle, setHistoryContentToggle] = useState(true)
  const { $t } = useIntl()
  const { read, write } =
    useEncodedParameter<ClientTroubleShootingSelectionsType>(
      'clientTroubleShootingSelections'
    )

  // Todo onApply should trigger new api call
  const onApply = (value: selectionType, selectionType: string) => {
    return write({ ...read(), [selectionType]: value })
  }
  return (
    <Row gutter={[16, 16]}>
      <Col span={historyContentToggle ? 18 : 24}>
        <Row gutter={[16, 16]}>
          <Col span={historyContentToggle ? 12 : 10} />
          <Col
            span={historyContentToggle ? 12 : 10}
            style={{ justifyContent: 'end' }}>
            <Row style={{ justifyContent: 'end' }} gutter={[4, 4]}>
              {ClientTroubleShootingConfig.selection.map((config) => (
                <Col span={historyContentToggle ? 8 : 7} key={config.selectionType}>
                  <NetworkFilter
                    multiple
                    defaultValue={
                      read()?.[
                        config.selectionType as keyof ClientTroubleShootingSelectionsType
                      ]
                        ? read()?.[
                            config.selectionType as keyof ClientTroubleShootingSelectionsType
                        ]
                        : config.defaultValue
                    }
                    placeholder={$t(config.placeHolder)}
                    options={config.options.map((option) => {
                      return { ...option, label: $t(option.label) }
                    })}
                    style={{ maxWidth: 132 }}
                    onApply={(value: selectionType) =>
                      onApply(value, config.selectionType)
                    }
                  />
                </Col>
              ))}
            </Row>
          </Col>
          {!historyContentToggle && (
            <Col span={4}>
              <Row style={{ justifyContent: 'end' }}>
                <Button
                  type='primary'
                  style={{ width: '96px' }}
                  onClick={() => {
                    setHistoryContentToggle(!historyContentToggle)
                  }}>
                  {$t(defineMessage({ defaultMessage: 'History' }))}
                </Button>
              </Row>
            </Col>
          )}
          <Col span={24}>
            <TimeLine />
          </Col>
        </Row>
      </Col>
      {historyContentToggle && (
        <Col span={6}>
          <History
            setHistoryContentToggle={setHistoryContentToggle}
            historyContentToggle
          />
        </Col>
      )}
    </Row>
  )
}
