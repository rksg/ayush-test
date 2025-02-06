import { Typography } from 'antd'
import { valueType }  from 'antd/lib/statistic/utils'

import { GridCol, GridRow, Loader } from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'

import { PoeUsageIcon, StyledAntStatistic } from './styledComponents'

const calculatePercentage = (value: number, totalVal: number)=> {
  if (Boolean(totalVal) === false) return 0
  return Math.round(value / totalVal * 100)
}
export interface PoeUtilizationBoxProps {
    isLoading: boolean,
    title: string
    isOnline: boolean
    value?: number
    totalVal?: number
}

export const PoeUtilizationBox = (props: PoeUtilizationBoxProps) => {
  const {
    isLoading,
    title,
    isOnline,
    value = 0,
    totalVal = 0
  } = props

  const statisticFormatter = (val: valueType) => {
    const valueWithUnit = (val as string).split(' ')
    const valueData = valueWithUnit[0]
    const valueUnit = valueWithUnit[1]
    return (<>
      <Typography.Text className='value'>{valueData}</Typography.Text>
      <Typography.Text className='unit'>{valueUnit}</Typography.Text>
    </>)
  }

  return (
    <Loader states={[{ isLoading }]}>
      <GridRow style={{ margin: 'auto' }}>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <PoeUsageIcon />
          {isOnline
            ? <StyledAntStatistic
              title={title}
              // eslint-disable-next-line max-len
              value={`${formatter('milliWattsFormat')(value)} / ${formatter('milliWattsFormat')(totalVal)}`}
              suffix={`(${calculatePercentage(value, totalVal)}%)`}
              formatter={statisticFormatter}
            />
            : <Typography.Title level={3}>--</Typography.Title>}
        </GridCol>
      </GridRow>
    </Loader>
  )
}