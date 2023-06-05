import { useCallback, useEffect, useRef, useState } from 'react'

import { Row, Col }                          from 'antd'
import { connect, EChartsType }              from 'echarts'
import ReactECharts                          from 'echarts-for-react'
import { useIntl, defineMessage, IntlShape } from 'react-intl'

import { Cascader, Button, Loader }           from '@acx-ui/components'
import { formatter, DateFormatEnum }          from '@acx-ui/formatter'
import { useEncodedParameter, useDateFilter } from '@acx-ui/utils'

import { ClientTroubleShootingConfig, DisplayEvent, IncidentDetails } from './config'
import { ConnectionEventPopover }                                     from './ConnectionEvent'
import { FormattedEvent, History }                                    from './EventsHistory'
import { TimeLine }                                                   from './EventsTimeline'
import { useClientInfoQuery }                                         from './services'
import * as UI                                                        from './styledComponents'


export type Filters = {
  category?: [];
  type?: [];
  radio?: [];
}
export const maxEventsMsg = (start: string, end: string, { $t }: IntlShape) => $t(
  defineMessage({
    defaultMessage: `Too much data to display in the selected period ({start} to {end}).
Please select a shorter period.`
  }), { start, end })

type SingleValueType = (string | number)[]
type selectionType = SingleValueType | SingleValueType[] | undefined

const isChartActive = (chart: EChartsType) => {
  return chart && chart.isDisposed && !chart.isDisposed()
}

export function getSelectedCallback (
  popoverVisible: boolean,
  panelVisible: boolean,
  eventState: DisplayEvent,
  item: FormattedEvent | IncidentDetails) {
  return () => (popoverVisible || panelVisible)
    && eventState
    && item
    && (item as FormattedEvent).event
    && (eventState.key === (item as FormattedEvent).event.key)
}

export function getPanelCallback (
  item: IncidentDetails | FormattedEvent,
  setEventState: CallableFunction,
  setVisible: CallableFunction
) {
  return (val: boolean) => {
    if (item && (item as FormattedEvent).event) {
      setEventState({ ...(item as FormattedEvent).event })
      setVisible(val)
    }
  }
}

export function ClientTroubleshooting ({ clientMac } : { clientMac: string }) {
  const [historyContentToggle, setHistoryContentToggle] = useState(true)
  const intl = useIntl()
  const { $t } = intl
  const { read, write } = useEncodedParameter<Filters>('clientTroubleShootingSelections')
  const { startDate, endDate, range } = useDateFilter()
  const results = useClientInfoQuery({ startDate, endDate, range, clientMac })
  const filters = read()
  const [eventState, setEventState] = useState({} as DisplayEvent)
  const [popoverVisible, setPopoverVisible] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
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
  const onPanelCallback = useCallback((item: IncidentDetails | FormattedEvent) => ({
    onClick: getPanelCallback(item, setEventState, setPanelVisible),
    selected: getSelectedCallback(popoverVisible, panelVisible, eventState, item)
  }), [eventState, popoverVisible, panelVisible])

  useEffect(() => {
    const charts = chartsRef.current
    const active = charts.filter(isChartActive)
    connect(active)
    chartsRef.current = active
  })

  const isMaxEventError = results.error?.message?.includes('CTP:MAX_EVENTS_EXCEEDED')

  return isMaxEventError
    ? <UI.ErrorPanel data-testid='ct-error-panel'>
      <span>{maxEventsMsg(
        formatter(DateFormatEnum.DateTimeFormat)(startDate),
        formatter(DateFormatEnum.DateTimeFormat)(endDate),
        intl
      )}</span>
    </UI.ErrorPanel>
    : (<Row gutter={[20, 16]} style={{ flex: 1 }}>
      <Col span={historyContentToggle ? 18 : 24}>
        <Row style={{ justifyContent: 'end' }} gutter={[20, 32]}>
          <Col span={historyContentToggle ? 24 : 21}>
            <Row style={{ justifyContent: 'end' }} gutter={[12, 6]} wrap={false}>
              {ClientTroubleShootingConfig.selection.map((config) => (
                <Col flex='185px' key={config.selectionType}>
                  <Cascader
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
                  setVisible={setPopoverVisible}
                  sharedChartName={sharedChartName}
                  connectChart={connectChart}
                  popoverRef={popoverRef}
                  onChartReady={onChartReady}
                />
                <ConnectionEventPopover
                  key={Number(popoverVisible)}
                  arrowPointAtCenter
                  autoAdjustOverflow={false}
                  event={eventState}
                  visible={popoverVisible}
                  onVisibleChange={setPopoverVisible}
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
              onPanelCallback={onPanelCallback}
            />
          </Loader>
        </Col>
      )}
    </Row>
    )
}
