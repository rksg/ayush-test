import { Progress as AntProgress } from 'antd'
import styled, { css }             from 'styled-components/macro'

import { TrendTypeEnum, incidentSeverities } from '@acx-ui/analytics/utils'

import { IncidentSeverities } from '.'

const pillColor = ({ type, color }: {
  type: TrendTypeEnum | IncidentSeverities | 'color',
  color?: string
}) => {
  switch (type) {
    case TrendTypeEnum.Positive: return 'var(--acx-semantics-green-50)'
    case TrendTypeEnum.Negative: return 'var(--acx-semantics-red-50)'
    case TrendTypeEnum.None: return 'var(--acx-neutrals-50)'
    case 'color': return color
    default: return `var(${incidentSeverities[type as IncidentSeverities].color})`
  }
}

const textStyle = css`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-6-font-size);
  color: var(--acx-primary-white);
`

export const Pill = styled.span`
  display: inline-block;
  border-radius: 10px;
  padding: 3px 8px;
  background-color: ${pillColor};
  line-height: var(--acx-subtitle-6-line-height);
  ${textStyle}
  font-weight: var(--acx-subtitle-6-font-weight-bold);
`

export const Progress = styled(AntProgress)`
  height: 20px;
  flex-direction: column;
  display: flex;
  flex-grow: 1;

  .ant-progress-outer {
    padding: 0;

    .ant-progress-inner {
      border-radius: 25px !important;
    }
  }

  .ant-progress-text {
    margin: 0px;
    text-align: center;
    vertical-align: middle;
    width: 100%;
    position: relative;
    top: -20px;
    line-height: 20px;
    ${textStyle}
    font-weight: var(--acx-body-font-weight-bold);
  }
`
