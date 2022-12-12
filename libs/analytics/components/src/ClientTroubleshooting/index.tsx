import { useState } from 'react'

import { Row, Col }               from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { NetworkFilter, Button, Loader }      from '@acx-ui/components'
import { useEncodedParameter, useDateFilter } from '@acx-ui/utils'

import { ClientTroubleShootingConfig } from './config'
import { History }                     from './EventsHistory'
import { TimeLine }                    from './EventsTimeline'
import { useClientInfoQuery }          from './services'

export type Filters = {
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
  const { startDate, endDate, range } = useDateFilter()
  const results = useClientInfoQuery({ startDate, endDate, range, clientMac })
  const filters = read()
  return (
    <Row gutter={[16, 16]} style={{ flex: 1 }}>
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
                      filters?.[
                        config.selectionType as keyof Filters
                      ]
                        ? filters?.[
                            config.selectionType as keyof Filters
                        ]
                        : config.defaultValue
                    }
                    placeholder={$t(config.placeHolder)}
                    options={config.options.map((option) => {
                      return { ...option, label: $t(option.label) }
                    })}
                    style={{ maxWidth: 132 }}
                    onApply={(value: selectionType) =>
                      write({ ...filters, [config.selectionType]: value })
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
          <Loader states={[results]}>
            <History
              setHistoryContentToggle={setHistoryContentToggle}
              historyContentToggle
              data={results.data}
              filters={filters}
            />
          </Loader>
        </Col>
      )}
    </Row>
  )
}
