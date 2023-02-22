import { useCallback, useEffect, useRef, useState } from 'react'

import { Row, Col }               from 'antd'
import { connect, EChartsType }   from 'echarts'
import ReactECharts               from 'echarts-for-react'
import { useIntl, defineMessage } from 'react-intl'

import { Select, Button, Loader }             from '@acx-ui/components'
import { useEncodedParameter, useDateFilter } from '@acx-ui/utils'

import { ClientTroubleShootingConfig, DisplayEvent } from './config'
import { ConnectionEventPopover }                    from './ConnectionEvent'
import { History }                                   from './EventsHistory'
import { TimeLine }                                  from './EventsTimeline'
import { useClientInfoQuery }                        from './services'
import * as UI                                       from './styledComponents'


export type Filters = {
  category?: [];
  type?: [];
  radio?: [];
}
type SingleValueType = (string | number)[]
type selectionType = SingleValueType | SingleValueType[] | undefined

export function ClientTroubleshooting ({ clientMac } : { clientMac: string }) {
  const [historyContentToggle, setHistoryContentToggle] = useState(true)
  const { $t } = useIntl()
  const { read, write } = useEncodedParameter<Filters>('clientTroubleShootingSelections')
  const { startDate, endDate, range } = useDateFilter()
  const results = useClientInfoQuery({ startDate, endDate, range, clientMac })
  const filters = read()
  const [eventState, setEventState] = useState({} as DisplayEvent)
  const [visible, setVisible] = useState(false)
  const sharedChartName = 'eventTimeSeriesGroup'
  const popoverRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<EChartsType[]>([])
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = sharedChartName
      connect(sharedChartName)
    }
  }
  const onChartReady = useCallback((chart: EChartsType) => { chartsRef.current.push(chart) }, [])
  useEffect(() => {
    const isChartActive = (chart: EChartsType) =>
      /* istanbul ignore next */
      chart && chart.isDisposed && !chart.isDisposed()
    const charts = chartsRef.current
    const active = charts.filter(isChartActive)
    connect(active)
    chartsRef.current = active

    return () => {
      const remainingCharts = charts.filter(isChartActive)
      remainingCharts.forEach(chart =>
        /* istanbul ignore next */
        chart.dispose())
      chartsRef.current = []
    }
  }, [])
  return (
    <Row gutter={[16, 16]} style={{ flex: 1 }}>
      <Col span={historyContentToggle ? 18 : 24}>
        <Row style={{ justifyContent: 'end' }} gutter={[16, 32]}>
          <Col span={historyContentToggle ? 15 : 11}>
            <Row style={{ justifyContent: 'end' }} gutter={[6, 6]} wrap={false}>
              {ClientTroubleShootingConfig.selection.map((config) => (
                <Col flex='185px' key={config.selectionType}>
                  <Select
                    entityName={config.entityName}
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
                    style={{ minWidth: 150 }}
                    onApply={(value: selectionType) =>
                      write({ ...filters, [config.selectionType]: value })
                    }
                    allowClear
                  />
                </Col>
              ))}
            </Row>
          </Col>
          {!historyContentToggle && (
            <Col span={3}>
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
            <UI.TimelineLoaderWrapper>
              <Loader states={[results]}>
                <TimeLine
                  data={results.data}
                  filters={filters}
                  setEventState={setEventState}
                  setVisible={setVisible}
                  sharedChartName={sharedChartName}
                  connectChart={connectChart}
                  popoverRef={popoverRef}
                  onChartReady={onChartReady}
                />
                <ConnectionEventPopover
                  key={Number(visible)}
                  arrowPointAtCenter
                  autoAdjustOverflow={false}
                  event={eventState}
                  visible={visible}
                  onVisibleChange={setVisible}
                  trigger='click'
                  placement='bottom'
                  align={{
                    targetOffset: [
                      (eventState as unknown as { x: number }).x,
                      (eventState as unknown as { y: number }).y
                    ]
                  }}
                >
                  <div key='popover-child' data-testid='popover-child' ref={popoverRef}/>
                </ConnectionEventPopover>
              </Loader>
            </UI.TimelineLoaderWrapper>
          </Col>
        </Row>
      </Col>
      {historyContentToggle && (
        <Col span={6}>
          <Loader states={[results]} >
            <History
              setHistoryContentToggle={setHistoryContentToggle}
              historyContentToggle
              data={results.data}
              filters={filters}
              setEventState={setEventState}
              setVisible={setVisible}
              chartsRef={chartsRef}
              visible={visible}
              eventState={eventState}
            />
          </Loader>
        </Col>
      )}
    </Row>
  )
}
