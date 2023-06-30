import { DonutChart, DonutChartData, DonutChartProps, Loader, NoActiveData } from '@acx-ui/components'

import { SpaceWrapper } from '../../SpaceWrapper'

export type ReduceReturnType = Record<string, number>

interface EdgeOverviewDonutWidgetProps {
  title:string,
  data: DonutChartData[] | undefined,
  isLoading: boolean,
  emptyMessage?: string,
  onClick?: DonutChartProps['onClick']
}

export function EdgeOverviewDonutWidget (props : EdgeOverviewDonutWidgetProps ) {
  const {
    title,
    isLoading,
    data,
    emptyMessage,
    onClick
  } = props

  return (
    <Loader states={[{ isLoading }]}>
      <SpaceWrapper full>
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
      </SpaceWrapper>
    </Loader>
  )
}
