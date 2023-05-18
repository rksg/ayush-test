import { Statistic as AntStatistic } from 'antd'
import { useIntl }                   from 'react-intl'
import styled                        from 'styled-components/macro'

import { Tooltip, GridCol, GridRow, Loader } from '@acx-ui/components'
import { formatter }                         from '@acx-ui/formatter'
import { EdgeResourceUtilizationEnum }       from '@acx-ui/rc/utils'

import { WrapperStyles } from './styledComponents'


const calculatePercentage = (value: number, totalVal: number)=> {
  if (Boolean(totalVal) === false) {
    if (Boolean(totalVal) === false) return 0
    return 100
  }
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
  const statisticTitle = title.split(' ').map(item => {
    return item+'\r\n'
  })

  return (
    <Loader states={[{ isLoading }]}>
      <GridRow className={className}>
        <GridCol col={{ span: 24 }} >
          {(type === EdgeResourceUtilizationEnum.CPU) ?
            <AntStatistic
              title={statisticTitle}
              valueStyle={(value > 90 ? { color: '#cf1322' } : {})}
              value={`${value}%`}
            />
            :
            <Tooltip
              title={
              // eslint-disable-next-line max-len
                $t({ defaultMessage: '{freeValue} free' }, { freeValue: formatter('bytesFormat')(totalVal - value) })
              }>
              <AntStatistic
                title={statisticTitle}
                value={formatter('bytesFormat')(value)}
                suffix={
                // eslint-disable-next-line max-len
                  $t({ defaultMessage: '({usedPercentage}%)' }, { usedPercentage: calculatePercentage(value, totalVal) })
                }
                // eslint-disable-next-line max-len
                valueStyle={(calculatePercentage(value, totalVal) > 90 ? { color: '#cf1322' } : {})}
              />
            </Tooltip>
          }
        </GridCol>
      </GridRow>
    </Loader>
  )
})`${WrapperStyles}`