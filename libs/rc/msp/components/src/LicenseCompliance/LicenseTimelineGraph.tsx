import { useEffect, useState } from 'react'

import { Col, Row }                    from 'antd'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import { renderToString }              from 'react-dom/server'
import { useIntl }                     from 'react-intl'
import AutoSizer                       from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Subtitle }                        from '@acx-ui/components'
import { DateFormatEnum, formatter }                       from '@acx-ui/formatter'
import { useGetLicenseMileageReportsQuery }                from '@acx-ui/msp/services'
import { MileageReportsRequestPayload, MileageSeriesData } from '@acx-ui/msp/utils'
import { EntitlementDeviceType }                           from '@acx-ui/rc/utils'

type DummySeries = {
  name: string,
  type: string,
  data: string[],
  itemStyle: {
    color: string
  },
  tooltip: { show: boolean }
} []

export default function LicenseTimelineGraph () {

  const { $t } = useIntl()
  const [chartOption, setChartOption] = useState<EChartsOption>({})
  const [chartTitle, setChartTitle] = useState<string>()

  const payload: MileageReportsRequestPayload = {
    page: 1,
    pageSize: 24, // this will return 24 months records
    filters: {
      usageType: 'ASSIGNED',
      licenseType: EntitlementDeviceType.APSW
    }
  }

  const { data: queryResults, isLoading } = useGetLicenseMileageReportsQuery(
    { payload })

  const colors = [cssStr('--acx-accents-blue-20'),
    cssStr('--acx-viz-qualitative-1'),
    cssStr('--acx-accents-blue-55')]


  useEffect(() => {
    if (queryResults?.data) {
      const dataList = queryResults?.data

      const months: string[] = []
      const years: number[] = []
      const seriesData: MileageSeriesData[] = []
      const lineData: number[] = []
      const barColors: string[] = []
      const legendData: string[] = []
      const dummySeries: DummySeries = []

      const title = $t({ defaultMessage:
         'Devices Configured {devices}, Licenses Used {usedLicenses}' },
      {
        devices: dataList[0]?.device || 0,
        usedLicenses: dataList[0]?.usedQuantity || 0
      })

      setChartTitle(title)

      const currentYear = new Date().getFullYear()

      dataList.forEach((data) => {
        const date = new Date(data.lastDate)
        const year = date.getFullYear()

        months.push(`${date.toLocaleString('default', { month: 'short' })}`)

        barColors.push(colors[year - currentYear])
        if(!years.includes(year))
          years.push(year)

        // if current quantity is 0 then consider first quanitity value of month from breakup
        // to render shadow bar, so it will show tooltip with entire
        // months license used quantity breakup

        const value = data.quantity === 0
          ? data.availableBreakUp[0]?.quantity || 0
          : data.quantity

        seriesData.push({ value, extraData: data.availableBreakUp,
          isZeroQuantity: data.quantity === 0 })

        lineData.push(data.usedQuantity)
      })

      years.forEach(year => {
        const yearString = $t({ defaultMessage: 'Year {year}' }, { year })
        legendData.push(yearString)

        // this is to show dummy series legends.
        dummySeries.push({
          name: yearString,
          type: 'graph',
          data: [],
          itemStyle: {
            color: colors[year - currentYear]
          },
          tooltip: { show: false }
        })
      })

      legendData.push($t({ defaultMessage: 'License Used' }))

      const _chartOption: EChartsOption = createChartOptions(
        months,
        seriesData,
        barColors,
        lineData,
        legendData,
        dummySeries)

      setChartOption(_chartOption)
    }
  }, [isLoading])

  const tooltipFormatter = (params: { data: MileageSeriesData }) => {
    const extraData = params.data.extraData

    return renderToString(<div>
      <Subtitle level={4}
        style={{
          textAlign: 'center'
        }}>{$t({ defaultMessage: 'Active Licenses' })}</Subtitle>
      <div style={{
        width: '200px',
        height: '100px',
        padding: '8px',
        overflowY: 'auto'
      }}>
        {extraData.map(data => {
          return <Row gutter={[8, 8]}>
            <Col span={18}>
              {formatter(DateFormatEnum.DateFormat)(data.expirationDate)}
            </Col>
            <Col span={6}>
              {data.quantity}
            </Col>
          </Row>
        })}
      </div>
    </div>)
  }

  const createChartOptions = function (monthsSeries: string [],
    seriesData: MileageSeriesData[],
    colorMap: string[],
    lineData: number[],
    legendData: string[],
    dummySeries: DummySeries) {

    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'click',
        position: 'top',
        borderColor: cssStr('--acx-neutrals-40'),
        formatter: tooltipFormatter,
        enterable: true
      },
      legend: {
        data: legendData,
        selectedMode: false,
        bottom: '5%'
      },
      xAxis: {
        type: 'category',
        data: monthsSeries,
        axisLabel: {
          align: 'center',
          interval: 0
        },
        axisPointer: {
          type: 'shadow'
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: $t({ defaultMessage: 'Active Licenses' }),
        nameLocation: 'middle',
        nameGap: 45
      },
      series: [
        {
          name: 'License Counts',
          type: 'bar',
          data: seriesData,
          itemStyle: {
            color: function (params: { dataIndex: number,
              data: { isZeroQuantity: boolean } }) {
              return params.data?.isZeroQuantity
                ? 'rgba(227,228,229, 0.5)'
                : colorMap[params.dataIndex]
            },
            borderRadius: 4
          },
          barWidth: 25
        },
        {
          name: 'License Used',
          type: 'line',
          data: lineData,
          itemStyle: {
            color: cssStr('--acx-viz-qualitative-2')
          },
          symbol: 'line',
          smooth: true
        },
        // Dummy series to show extra legends
        ...dummySeries
      ],
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '34%',
        containLabel: true
      },
      dataZoom: []
    }
    return option
  }


  return <Loader states={[{
    isLoading
  }]}>
    <>
      <Subtitle level={4}
        style={{
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 650,
          color: cssStr('--acx-neutrals-70'),
          margin: '0px'
        }}>
        {chartTitle}
      </Subtitle>
      <AutoSizer>{
        ({ height, width }) => <div style={{
          width,
          height: 'auto',
          overflowX: 'auto'
        }}>
          <ReactECharts
            style={{
              width,
              height }}
            option={chartOption}
            opts={{ renderer: 'svg' }}
          />
        </div>}</AutoSizer>
    </>
  </Loader>
}