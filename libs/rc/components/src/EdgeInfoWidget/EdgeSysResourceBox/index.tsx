import { Statistic as AntStatistic } from 'antd'
import { useIntl }                   from 'react-intl'
import styled                        from 'styled-components/macro'

import { Tooltip, GridCol, GridRow, Loader } from '@acx-ui/components'
import { formatter }                         from '@acx-ui/formatter'
import { EdgeResourceUtilizationEnum }       from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../../SpaceWrapper/index'

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

  const usedValue:number = totalVal ? value/totalVal: totalVal
  const usedPercentage:number = Math.round(usedValue * 100)

  const freeValue = formatter(type === EdgeResourceUtilizationEnum.CPU
    ? 'hertzFormat' : 'bytesFormat')(totalVal - value)

  const chartValue = formatter(type === EdgeResourceUtilizationEnum.CPU
    ? 'hertzFormat' : 'bytesFormat')(value)

  return (
    <Loader states={[{ isLoading }]}>
      <SpaceWrapper className={className}>
        <GridRow>
          <GridCol col={{ span: 24 }} >
            <Tooltip title={$t({ defaultMessage: '{freeValue} free' }, { freeValue })}>
              <AntStatistic
                title={statisticTitle}
                value={chartValue}
                suffix={$t({ defaultMessage: '({usedPercentage}%)' }, { usedPercentage })}
              />
            </Tooltip>
          </GridCol>
        </GridRow>
      </SpaceWrapper>
    </Loader>
  )
})`
  .ant-statistic {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .ant-statistic-title {
    color: var(--acx-primary-black);
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
    white-space: pre-line;
  }
  .ant-statistic-content {
    color: var(--acx-primary-black);
    .ant-statistic-content-value {
      font-size: 32px;
      font-weight: var(--acx-body-font-weight-bold);
    }
    .ant-statistic-content-suffix {
      font-size: var(--acx-body-2-font-size);
    }
  }
`