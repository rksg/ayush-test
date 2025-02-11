import { Statistic as AntStatistic, Typography } from 'antd'
import { valueType }                             from 'antd/lib/statistic/utils'
import { useIntl }                               from 'react-intl'
import styled                                    from 'styled-components/macro'

import { Tooltip, GridCol, GridRow, Loader } from '@acx-ui/components'
import { formatter }                         from '@acx-ui/formatter'
import { EdgeResourceUtilizationEnum }       from '@acx-ui/rc/utils'

import { WrapperStyles } from './styledComponents'


const calculatePercentage = (value: number, totalVal: number)=> {
  if (Boolean(totalVal) === false) return 0
  return Math.round(value / totalVal * 100)
}
export interface EdgeStateCardProps {
    isLoading: boolean,
    type: string
    title: string
    value?: number
    totalVal?: number
    className?: string
}

export const EdgeSysResourceBox = styled((props: EdgeStateCardProps) => {
  const { $t } = useIntl()
  const {
    className,
    isLoading,
    type,
    title,
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
      <GridRow className={className}>
        <GridCol col={{ span: 24 }} >
          {(type === EdgeResourceUtilizationEnum.CPU) ?
            <AntStatistic
              title={title}
              valueStyle={(value > 90 ? { color: '#cf1322' } : {})}
              value={`${value} %`}
              formatter={statisticFormatter}
            />
            :
            <Tooltip placement='bottom'
              title={
                $t({ defaultMessage: '{freeValue} free' },
                  { freeValue: formatter('bytesFormat')(totalVal - value) })
              }>
              <AntStatistic
                title={title}
                value={formatter('bytesFormat')(value)}
                suffix={`(${calculatePercentage(value, totalVal)}%)`}
                formatter={statisticFormatter}
                valueStyle={(calculatePercentage(value, totalVal) > 90
                  ? { color: '#cf1322' }
                  : {}
                )}
              />
            </Tooltip>
          }
        </GridCol>
      </GridRow>
    </Loader>
  )
})`${WrapperStyles}`