import { DonutChart, DonutChartData, DonutChartProps, Loader, NoActiveData } from '@acx-ui/components'

import { StyledSpace } from './styledComponents'

export type ReduceReturnType = Record<string, number>

interface EdgeOverviewDonutWidgetProps {
  title:string,
  data: DonutChartData[] | undefined,
  isLoading: boolean,
  isFetching?: boolean,
  emptyMessage?: string,
  onClick?: DonutChartProps['onClick']
}

export function EdgeOverviewDonutWidget (props : EdgeOverviewDonutWidgetProps ) {
  const {
    title,
    isLoading,
    isFetching = false,
    data,
    emptyMessage,
    onClick
  } = props

  return (
    <Loader states={[{ isLoading, isFetching }]}>
      <StyledSpace>
        { (!emptyMessage || Number(data?.length) > 0)
          ? <DonutChart
            title={title}
            style={{ width: 100, height: 100 }}
            legend={'name-value'}
            data={data!}
            onClick={onClick}
          />
          : <NoActiveData text={emptyMessage}/>
        }
      </StyledSpace>
    </Loader>
  )
}
