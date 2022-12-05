import { useState } from 'react'

import { Row, Col }               from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { Select, Button }      from '@acx-ui/components'
import { useEncodedParameter } from '@acx-ui/utils'

import { ClientTroubleShootingConfig } from './config'
import { History }                     from './EventsHistory'
import { TimeLine }                    from './EventsTimeline'

type Filters = {
  category?: [];
  type?: [];
  radio?: [];
}
type SingleValueType = (string | number)[]
type selectionType = SingleValueType | SingleValueType[] | undefined

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ClientTroubleshooting ({ clientMac } : { clientMac: string }) {
  const [historyContentToggle, setHistoryContentToggle] = useState(true)
  const { $t } = useIntl()
  const { read, write } = useEncodedParameter<Filters>('clientTroubleShootingSelections')
  return (
    <Row gutter={[16, 16]}>
      <Col span={historyContentToggle ? 18 : 24}>
        <Row style={{ justifyContent: 'end' }} gutter={[16, 16]}>
          <Col span={historyContentToggle ? 15 : 11}>
            <Row style={{ justifyContent: 'end' }} gutter={[6, 6]}>
              {ClientTroubleShootingConfig.selection.map((config) => (
                <Col span={8} key={config.selectionType}>
                  <Select
                    multiple
                    defaultValue={
                      read()?.[
                        config.selectionType as keyof Filters
                      ]
                        ? read()?.[
                            config.selectionType as keyof Filters
                        ]
                        : config.defaultValue
                    }
                    placeholder={$t(config.placeHolder)}
                    options={config.options.map((option) => {
                      return { ...option, label: $t(option.label) }
                    })}
                    style={{ minWidth: 150 }}
                    onApply={(value: selectionType) =>
                      write({ ...read(), [config.selectionType]: value })
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
