import { useIntl } from 'react-intl'
// import AutoSizer   from 'react-virtualized-auto-sizer'

import { Tooltip, GridCol, GridRow } from '@acx-ui/components'
import { formatter }                 from '@acx-ui/utils'

import { SpaceWrapper } from '../../SpaceWrapper/index'

import { Statistic } from './styledComponents'

export interface EdgeStateCardProps {
    type: string
    title: string
    value: number
    totalVal: number
}

export const EdgeSysResourceBox = (props: EdgeStateCardProps) => {
  const { $t } = useIntl()
  const { type, value = 0, totalVal = 0 } = props
  const statisticTitle = props?.title.split(' ').map(item => {
    return (<>{item}<br /></>)
  })

  const usedPercentage:number = totalVal ? Math.round(value/totalVal): totalVal
  const freeValue = formatter(type==='cpu'?'radioFormat':'bytesFormat')(totalVal - value)

  return (
    <SpaceWrapper>
      <GridRow>
        <GridCol col={{ span: 24 }} >
          <Tooltip title={$t({ defaultMessage: '{freeValue} free' }, { freeValue })}>
            <Statistic
              title={statisticTitle}
              value={formatter(props.type==='cpu'?'radioFormat':'bytesFormat')(value)}
              suffix={$t({ defaultMessage: '({usedPercentage}%)' }, { usedPercentage })}
            />
          </Tooltip>
        </GridCol>
      </GridRow>
    </SpaceWrapper>
  )
}