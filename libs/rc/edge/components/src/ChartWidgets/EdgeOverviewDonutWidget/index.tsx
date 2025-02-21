import AutoSizer from 'react-virtualized-auto-sizer'

import { DonutChart, DonutChartData, DonutChartProps, Loader, NoActiveData } from '@acx-ui/components'

import { SizedDonutChartWrapper } from './styledComponents'

export type ReduceReturnType = Record<string, number>

interface EdgeOverviewDonutWidgetProps {
  title:string,
  data: DonutChartData[] | undefined,
  isLoading: boolean,
  isFetching?: boolean,
  emptyMessage?: string,
  onClick?: DonutChartProps['onClick']
  size?: { width: number, height: number }
}

export function EdgeOverviewDonutWidget (props : EdgeOverviewDonutWidgetProps ) {
  const {
    title,
    isLoading,
    isFetching = false,
    data,
    emptyMessage,
    onClick,
    size
  } = props

  const getContent = (size?: { width: number, height: number }) => {
    return (size
      ? <SizedDonutChartWrapper>
        <DonutChart
          title={title}
          style={{ width: size.width, height: size.height }}
          legend={'name-value'}
          data={data!}
          onClick={onClick}
        />
      </SizedDonutChartWrapper>
      : <AutoSizer>
        {({ height, width }) => {
          return <DonutChart
            title={title}
            style={{ width, height }}
            legend={'name-value'}
            data={data!}
            onClick={onClick}
          />}
        }
      </AutoSizer>)
  }
  return (
    <Loader states={[{ isLoading, isFetching }]}>
      {(!emptyMessage || Number(data?.length)) > 0
        ? getContent(size)
        : <NoActiveData text={emptyMessage} />}
    </Loader>
  )
}
