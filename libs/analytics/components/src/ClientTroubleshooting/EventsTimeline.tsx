import React, { RefObject, useState } from 'react'

import { Row, Col }                   from 'antd'
import { EChartsType }                from 'echarts'
import ReactECharts                   from 'echarts-for-react'
import { flatten }                    from 'lodash'
import moment                         from 'moment-timezone'
import { useIntl, MessageDescriptor } from 'react-intl'

import { Incident }      from '@acx-ui/analytics/utils'
import { Tooltip }       from '@acx-ui/components'
import { useDateFilter } from '@acx-ui/utils'

import {
  ClientTroubleShootingConfig,
  TYPES,
  Event,
  TimelineData,
  EventsCategoryMap,
  NetworkIncidentCategoryMap,
  RoamingByAP,
  RoamingConfigParam,
  RoamingTimeSeriesData,
  DisplayEvent,
  ALL
} from './config'
import { ClientInfoData, ConnectionEvent } from './services'
import * as UI                             from './styledComponents'
import { TimelineChart }                   from './TimelineChart'
import {
  transformEvents,
  transformConnectionQualities,
  connectionDetailsByAP,
  connectionDetailsByApChartData,
  getRoamingChartConfig,
  getRoamingSubtitleConfig,
  getTimelineData,
  getChartData,
  labelFormatter,
  transformIncidents
} from './util'

import { Filters } from '.'

type TimeLineProps = {
  data?: ClientInfoData;
  filters: Filters;
  setEventState: (event: DisplayEvent) => void,
  setVisible: (visible: boolean) => void,
  connectChart: (instance: ReactECharts) => void,
  sharedChartName: string,
  popoverRef: RefObject<HTMLDivElement>,
  onChartReady: (instance: EChartsType) => void,
}

type CoordDisplayEvent = DisplayEvent & {
  x: number,
  y: number
}

export function TimeLine (props: TimeLineProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const {
    data, filters, connectChart, sharedChartName, onChartReady,
    popoverRef, setEventState, setVisible
  } = props
  const types: string[] = flatten(filters ? filters.type ?? [[]] : [[]])
  const radios: string[] = flatten(filters ? filters.radio ?? [[]] : [[]])
  const selectedCategories: string[] = flatten(filters ? filters.category ?? [[]] : [[]])
  const qualities = transformConnectionQualities(data?.connectionQualities)
  const events = transformEvents(
    data?.connectionEvents as ConnectionEvent[],
    types,
    radios
  ) as Event[]
  const incidents = transformIncidents(
    data?.incidents as Incident[],
    selectedCategories,
    types,
    intl
  )
  const [expandObj, setExpandObj] = useState({
    connectionEvents: false,
    roaming: false,
    connectionQuality: false,
    networkIncidents: false
  })
  const onExpandToggle = (type: keyof TimelineData, toggle: boolean) =>
    setExpandObj({
      ...expandObj,
      [type]: !toggle
    })
  const toggleIcon = (
    isExpand: boolean, type: keyof TimelineData, noData?: boolean | undefined
  ) => {
    if (noData) {
      return <Tooltip
        title={$t({ defaultMessage: 'No APs Available' })}
        placement='top'
      >
        <UI.StyledDisabledPlusSquareOutline
          style={{ cursor: 'not-allowed' }}
        />
      </Tooltip>
    }

    return isExpand ? (
      <UI.StyledMinusSquareOutlined
        style={{ cursor: 'pointer' }}
        onClick={() => onExpandToggle(type, expandObj[type])}
      />
    ) : (
      <UI.StyledPlusSquareOutlined
        style={{ cursor: 'pointer' }}
        onClick={() => onExpandToggle(type, expandObj[type])}
      />
    )
  }

  const TimelineData = getTimelineData(events, incidents)
  const roamingEventsAps = connectionDetailsByAP(data?.connectionDetailsByAp as RoamingByAP[])
  const roamingEventsTimeSeries = connectionDetailsByApChartData(
    data?.connectionDetailsByAp as RoamingByAP[]
  ) as unknown as RoamingTimeSeriesData[]

  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [moment(startDate).valueOf(), moment(endDate).valueOf()]

  const roamingTooltipCallback = (apMac: string, apModel: string, apFirmware: string) =>
    $t({ defaultMessage: 'MAC Address: {apMac} {br}Model: {apModel} {br}Firmware: {apFirmware}' },
      { br: '\n', apMac, apModel, apFirmware })

  return (
    <Row gutter={[16, 16]} wrap={false}>
      <Col flex='200px'>
        <Row gutter={[16, 16]} style={{ rowGap: '4px' }}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <React.Fragment key={index}>
              <Col span={3}>
                {toggleIcon(
                  expandObj[config?.value as keyof TimelineData],
                  config?.value as keyof TimelineData,
                  (config?.value === TYPES.ROAMING)
                    && getRoamingSubtitleConfig(roamingEventsAps as RoamingConfigParam)[0].noData)
                }
              </Col>
              <Col
                span={17}
                style={expandObj[config?.value as keyof TimelineData] ? {} : { marginBottom: 38 }}>
                <UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>
              </Col>
              <Col style={{ lineHeight: '25px' }} span={4}>
                {config.showCount ? (
                  <UI.TimelineCount>
                    {TimelineData[config.value as keyof TimelineData]?.['all'].length ?? 0}
                  </UI.TimelineCount>
                ) : null}
              </Col>
              {expandObj[config?.value as keyof TimelineData] &&
                (config.value === TYPES.ROAMING
                  ? getRoamingSubtitleConfig(roamingEventsAps as RoamingConfigParam)
                  : config?.subtitle
                )?.map((subtitle, index) => (
                  <React.Fragment key={subtitle.value + index}>
                    <Col span={17} offset={3} style={subtitle.isLast ? { marginBottom: 40 } : {}}>
                      {config.value === TYPES.ROAMING
                        ? <UI.RoamingTimelineSubContent>
                          {
                            ((subtitle as { noData: boolean }).noData)
                              ? null
                              : <Tooltip
                                placement='top'
                                title={roamingTooltipCallback(
                                  (subtitle as { apMac: string }).apMac,
                                  (subtitle as { apModel: string }).apModel,
                                  (subtitle as { apFirmware: string }).apFirmware)}
                              >
                                {subtitle.title as string}
                              </Tooltip>
                          }
                        </UI.RoamingTimelineSubContent>
                        : <UI.TimelineSubContent>
                          {($t(subtitle.title as MessageDescriptor))}
                        </UI.TimelineSubContent>}
                    </Col>
                    <Col span={4}>
                      {config.showCount ? (
                        <UI.TimelineCount>
                          {
                            TimelineData?.[config.value as keyof TimelineData]?.[
                              subtitle.value as keyof (
                                | EventsCategoryMap
                                | NetworkIncidentCategoryMap
                              )
                            ]?.length
                          }
                        </UI.TimelineCount>
                      ) : null}
                    </Col>
                  </React.Fragment>
                ))}
            </React.Fragment>
          ))}
        </Row>
      </Col>
      <Col flex='auto'>
        <Row gutter={[16, 16]} style={{ rowGap: 0 }}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <Col span={24} key={config.value}>
              <TimelineChart
                key={index}
                index={index}
                style={{ width: 'auto', marginBottom: 8 }}
                data={getChartData(
        config?.value as keyof TimelineData,
        TimelineData.connectionEvents.all,
        expandObj[config?.value as keyof TimelineData],
        !Array.isArray(qualities) ? qualities.all : [],
        Array.isArray(incidents) ? incidents : [],
        {
          ...roamingEventsTimeSeries,
          [ALL]: TimelineData.roaming.all
        } as RoamingTimeSeriesData[]
                )}
                showResetZoom={config?.showResetZoom}
                chartBoundary={chartBoundary}
                hasXaxisLabel={config?.hasXaxisLabel}
                tooltipFormatter={labelFormatter}
                mapping={
                  expandObj[config?.value as keyof TimelineData]
                    ? config.value === TYPES.ROAMING
                      ? config.chartMapping.concat(
                        getRoamingChartConfig(roamingEventsAps as RoamingConfigParam)
                      ).reverse()
                      : config.chartMapping.slice().reverse()
                    : [config.chartMapping[0]]
                }
                onDotClick={(params) => {
                  setEventState(params as CoordDisplayEvent)
                  setVisible(true)
                }}
                chartRef={connectChart}
                sharedChartName={sharedChartName}
                popoverRef={popoverRef}
                onChartReady={onChartReady}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  )
}
