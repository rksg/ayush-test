import { Typography } from 'antd'
import { valueType }  from 'antd/lib/statistic/utils'

import { GridCol, GridRow, Loader } from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'
import { noDataDisplay }            from '@acx-ui/utils'

import { PoeUsageIcon, StyledAntStatistic } from './styledComponents'

const calculatePercentage = (value: number, totalVal: number): number=> {
  if (Boolean(totalVal) === false) return 0
  return value / totalVal
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
    const valuesWithUnit = (val as string).split('/')
    const used = valuesWithUnit[0]
    const total = valuesWithUnit[1]
    return (<>
      <Typography.Text className='value'>{used}</Typography.Text>
      <Typography.Text>/</Typography.Text>
      <Typography.Text className='value'>{total}</Typography.Text>
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
              value={`${value}w/${totalVal}w`}
              suffix={`(${formatter('percentFormatRound')(calculatePercentage(value, totalVal))})`}
              formatter={statisticFormatter}
            />
            : <StyledAntStatistic
              title={title}
              value={noDataDisplay}
              formatter={(val: valueType) => <Typography.Title level={3}>{val}</Typography.Title>}
            />
          }
        </GridCol>
      </GridRow>
    </Loader>
  )
}