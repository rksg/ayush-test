import { Space }                   from 'antd'
import { Progress as AntProgress } from 'antd'
import styled, { css }             from 'styled-components'

import { DonutChart } from '@acx-ui/components'

export const Wrapper = styled(Space)`
justify-content: left;
width: 100%;
height: 100%;
`
export const DonutChartWidget = styled(DonutChart)`
  svg {
    cursor: pointer
  }
`

export const TopTitle = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const LargePercent = styled.span`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-1-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
  line-height: var(--acx-headline-1-line-height);
  display: flex;
  margin-top: 10px;
  align-items: baseline;
`

const textStyle = css`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-6-font-size);
  color: var(--acx-primary-white);
`

export const Progress = styled(AntProgress)`
  height: 16px;
  flex-direction: column;
  display: flex;
  flex-grow: 1;

  .ant-progress-outer {
    padding: 0;
  }

  .ant-progress-text {
    margin: 0px;
    text-align: center;
    vertical-align: middle;
    width: 100%;
    position: relative;
    top: -18px;
    line-height: 16px;
    ${textStyle}
    font-weight: var(--acx-body-font-weight-bold);
  }
`