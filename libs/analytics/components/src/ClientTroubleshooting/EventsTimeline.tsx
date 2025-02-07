import React, { RefObject, useState } from 'react'

import { Row, Col }                   from 'antd'
import { EChartsType }                from 'echarts'
import ReactECharts                   from 'echarts-for-react'
import { flatten }                    from 'lodash'
import moment                         from 'moment-timezone'
import { useIntl, MessageDescriptor } from 'react-intl'

import { Incident, overlapsRollup }         from '@acx-ui/analytics/utils'
import { getDefaultEarliestStart, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { useDateFilter }                    from '@acx-ui/utils'

import { useIncidentToggles } from '../useIncidentToggles'

import {
  TYPES,
  Event,
  TimelineData,
  RoamingByAP,
  RoamingConfigParam,
  RoamingTimeSeriesData,
  DisplayEvent,
  ALL,
  TimelineDataCategoryMap
} from './config'
import { ClientInfoData, ConnectionEvent } from './services'
import * as UI                             from './styledComponents'
import { TimelineChart, granularityText }  from './TimelineChart'
import useClientTroubleshootingConfig      from './useClientTroubleshootingConfig'
import {
  transformEvents,
  transformConnectionQualities,
  connectionDetailsByAP,
  connectionDetailsByApChartData,
  getRoamingChartConfig,
  getRoamingSubtitleConfig,
  getTimelineData,
  getChartData,
  transformIncidents
} from './util'

import { Filters } from '.'

type TimelineProps = {
  data?: ClientInfoData;
  filters: Filters;
  setEventState: (event: DisplayEvent) => void,
  setVisible: (visible: boolean) => void,
  connectChart: (instance: ReactECharts) => void,
  sharedChartName: string,
  popoverRef: RefObject<HTMLDivElement>,
  onChartReady: (instance: EChartsType) => void
}

type CoordDisplayEvent = DisplayEvent & {
  x: number,
  y: number
}

export const checkRollup = (value: string, startDate: string) => {
  return overlapsRollup(startDate)
  && (value === 'roaming' || value === 'connectionQuality')
}

export function Timeline (props: TimelineProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const toggles = useIncidentToggles()
  const {
    clientTroubleshootingConfigType: { timeline },
    isBtmEventsOn
  } = useClientTroubleshootingConfig()

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
    isExpand: boolean, type: keyof TimelineData, noData?: boolean | undefined, druidRollup?: boolean
  ) => {
    if (noData || druidRollup) {
      return <Tooltip
        title={<UI.TooltipTextWrapper>{noData
          ? $t({ defaultMessage: 'No APs Available' })
          : $t(granularityText)
        }</UI.TooltipTextWrapper>}
        placement='topLeft'
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
    ) : <UI.StyledPlusSquareOutlined
      style={{ cursor: 'pointer' }}
      onClick={() => onExpandToggle(type, expandObj[type])}
    />
  }

  const timelineData = getTimelineData(events, incidents, toggles, isBtmEventsOn)
  const roamingEventsAps = connectionDetailsByAP(
    data?.connectionDetailsByAp as RoamingByAP[]
  ) as RoamingConfigParam
  const roamingEventsTimeSeries = connectionDetailsByApChartData(
    data?.connectionDetailsByAp as RoamingByAP[]
  ) as unknown as RoamingTimeSeriesData[]
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  const chartBoundary = [moment(startDate).valueOf(), moment(endDate).valueOf()]

  const roamingTooltipCallback = (apMac: string, apModel: string, apFirmware: string) =>
    $t({ defaultMessage: 'MAC Address: {apMac} {br}Model: {apModel} {br}Firmware: {apFirmware}' },
      { br: '\n', apMac, apModel, apFirmware })

  return (
    <Row gutter={[16, 16]} wrap={false}>
      <Col flex='200px'>
        <Row gutter={[16, 16]} style={{ rowGap: '4px' }}>
          {timeline
            .filter(({ isVisible }) => isVisible())
            .map((config, index) => {
              const subtitles = (
                config.value === TYPES.ROAMING
                  ? getRoamingSubtitleConfig(roamingEventsAps)
                  : config?.subtitle
              )?.filter(({ isVisible }) => isVisible())

              return (
                <React.Fragment key={index}>
                  <Col span={3}>
                    {toggleIcon(
                      expandObj[config?.value as keyof TimelineData],
                      config?.value as keyof TimelineData,
                      config?.value === TYPES.ROAMING &&
                        getRoamingSubtitleConfig(roamingEventsAps)[0].noData,
                      checkRollup(config?.value, startDate)
                    )}
                  </Col>
                  <Col
                    span={17}
                    style={
                      expandObj[config?.value as keyof TimelineData] ? {} : { marginBottom: 38 }
                    }
                  >
                    <UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>
                  </Col>
                  <Col style={{ lineHeight: '25px' }} span={4}>
                    {config.showCount ? (
                      <UI.TimelineCount>
                        {timelineData[config.value as keyof TimelineData]?.['all'].length ?? 0}
                      </UI.TimelineCount>
                    ) : null}
                  </Col>
                  {expandObj[config?.value as keyof TimelineData] &&
                    subtitles?.map((subtitle, index) => {
                      const isLast = index === subtitles.length - 1
                      return (
                        <React.Fragment key={subtitle.value + index}>
                          <Col span={17} offset={3} style={isLast ? { marginBottom: 40 } : {}}>
                            {config.value === TYPES.ROAMING ? (
                              <UI.RoamingTimelineSubContent>
                                {(subtitle as { noData: boolean }).noData ? null : (
                                  <Tooltip
                                    placement='top'
                                    title={roamingTooltipCallback(
                                      (subtitle as { apMac: string }).apMac,
                                      (subtitle as { apModel: string }).apModel,
                                      (subtitle as { apFirmware: string }).apFirmware
                                    )}
                                  >
                                    {subtitle.title as string}
                                  </Tooltip>
                                )}
                              </UI.RoamingTimelineSubContent>
                            ) : (
                              <UI.TimelineSubContent>
                                {$t(subtitle.title as MessageDescriptor)}
                              </UI.TimelineSubContent>
                            )}
                          </Col>
                          <Col span={4}>
                            {config.showCount ? (
                              <UI.TimelineCount>
                                {
                                  timelineData?.[config.value as keyof TimelineData]?.[
                                    subtitle.value as keyof TimelineDataCategoryMap
                                  ]?.length
                                }
                              </UI.TimelineCount>
                            ) : null}
                          </Col>
                        </React.Fragment>
                      )
                    })}
                </React.Fragment>
              )
            })}
        </Row>
      </Col>
      <Col flex='auto'>
        <Row gutter={[16, 16]} style={{ rowGap: 0 }}>
          {timeline
            .filter(({ isVisible }) => isVisible())
            .map((config, index) => {
              const chartMapping = config.chartMapping.filter(({ isVisible }) =>
                isVisible()
              )
              return (
                <Col span={24} key={config.value}>
                  <TimelineChart
                    key={index}
                    index={index}
                    style={{ width: 'auto', marginBottom: 8 }}
                    data={getChartData(
                      config?.value as keyof TimelineData,
                      timelineData.connectionEvents.all,
                      expandObj[config?.value as keyof TimelineData],
                      !Array.isArray(qualities) ? qualities.all : [],
                      Array.isArray(incidents) ? incidents : [],
                      {
                        ...roamingEventsTimeSeries,
                        [ALL]: timelineData.roaming.all
                      } as RoamingTimeSeriesData[]
                    )}
                    showResetZoom={config?.showResetZoom}
                    chartBoundary={chartBoundary}
                    hasXaxisLabel={config?.hasXaxisLabel}
                    mapping={
                      expandObj[config?.value as keyof TimelineData]
                        ? config.value === TYPES.ROAMING
                          ? chartMapping
                            .concat(getRoamingChartConfig(roamingEventsAps))
                            .reverse()
                          : chartMapping.slice().reverse()
                        : [chartMapping[0]]
                    }
                    onDotClick={
                      /* istanbul ignore next */
                      (params) => {
                        /* istanbul ignore next */
                        setEventState(params as CoordDisplayEvent)
                        /* istanbul ignore next */
                        setVisible(true)
                      }}
                    chartRef={connectChart}
                    sharedChartName={sharedChartName}
                    popoverRef={popoverRef}
                    onChartReady={onChartReady}
                    startDate={startDate}
                    value={config?.value}
                  />
                </Col>
              )
            })}
        </Row>
      </Col>
    </Row>
  )
}
