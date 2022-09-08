import { Progress as AntProgress } from 'antd'
import styled, { css }             from 'styled-components/macro'

import { incidentSeverities } from '@acx-ui/analytics/utils'

import { TrendType, IncidentSeverities } from '.'

const pillColor = ({ type }: { type: TrendType | IncidentSeverities }) => {
  switch (type) {
    case 'positive': return '--acx-semantics-green-50'
    case 'negative': return '--acx-semantics-red-50'
    case 'none': return '--acx-neutrals-50'
    default: return incidentSeverities[type].color
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
  ${textStyle}
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  line-height: var(--acx-subtitle-6-line-height);
  background-color: var(${pillColor});
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

      .ant-progress-bg {
        background-color: var(--acx-accents-blue-50);
      }
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
    font-weight: var(--acx-subtitle-5-font-weight)
  }
`
