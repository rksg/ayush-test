import { Statistic as AntStatistic } from 'antd'
import { useIntl }                   from 'react-intl'
import styled                        from 'styled-components/macro'

import { Tooltip, GridCol, GridRow }   from '@acx-ui/components'
import { EdgeResourceUtilizationEnum } from '@acx-ui/rc/utils'
import { formatter }                   from '@acx-ui/utils'

import { SpaceWrapper } from '../../SpaceWrapper/index'

export interface EdgeStateCardProps {
    type: string
    title: string
    value?: number
    totalVal?: number
    className?: string
}

export const EdgeSysResourceBox = styled((props: EdgeStateCardProps) => {
  const { $t } = useIntl()
  const { className, type, title = '', value = 0, totalVal = 0 } = props
  const statisticTitle = title.split(' ').map(item => {
    return item+'\r\n'
  })

  const usedPercentage:number = totalVal ? Math.round(value/totalVal): totalVal
  const freeValue = formatter(type === EdgeResourceUtilizationEnum.CPU ? 'radioFormat' : 'bytesFormat')(totalVal - value)

  return (
    <SpaceWrapper className={className}>
      <GridRow>
        <GridCol col={{ span: 24 }} >
          <Tooltip title={$t({ defaultMessage: '{freeValue} free' }, { freeValue })}>
            <AntStatistic
              title={statisticTitle}
              value={formatter(type === EdgeResourceUtilizationEnum.CPU ? 'radioFormat' : 'bytesFormat')(value)}
              suffix={$t({ defaultMessage: '({usedPercentage}%)' }, { usedPercentage })}
            />
          </Tooltip>
        </GridCol>
      </GridRow>
    </SpaceWrapper>
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