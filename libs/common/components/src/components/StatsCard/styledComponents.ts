import {
  Statistic as AntStatistic,
  Divider as AntDivider } from 'antd'
import styled, { css } from 'styled-components/macro'

export type Type = keyof typeof colors

export const colors = {
  green: {
    background: '--acx-semantics-green-50',
    activeBackground: '--acx-semantics-green-60',
    text: '--acx-primary-white'
  },
  red: {
    background: '--acx-semantics-red-50',
    activeBackground: '--acx-semantics-red-60',
    text: '--acx-primary-white'
  },
  yellow: {
    background: '--acx-semantics-yellow-40',
    activeBackground: '--acx-semantics-yellow-50',
    text: '--acx-primary-white'
  },
  grey: {
    background: '--acx-neutrals-30',
    activeBackground: '--acx-neutrals-40',
    text: '--acx-primary-black'
  }
} as const

export const Wrapper = styled.div<{ $type: string }>`
  border: 0;
  padding-block: 10px;
  background: var(${props => colors[props.$type as Type].background});
  border-radius: 3px;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
`
export const Title = styled.div<{ $type: string }>`
  color:var(${props => colors[props.$type as Type].text});
  font-size: var(--acx-headline-5-font-size);
  font-weight: var(--acx-headline-5-font-weight-bold);
  padding: 5px 0px 10px 0px;
`
export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  width: 100%;
`
export const Link = styled.div<{ $type: string, $disabled?: boolean }>`
  opacity: 0.7;
  color: var(${props => colors[props.$type as Type].text});
  ${props => (props.$disabled) ? css`cursor: auto;` : css`cursor: pointer;`}
  font-size: var(--acx-subtitle-6-font-size);
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  line-height: var(--acx-subtitle-6-line-height);
  border-bottom: 1px dotted var(${props => colors[props.$type as Type].text});
  padding: 10px 0px 0px 0px;
`
export const Statistic = styled(AntStatistic)<{ $type: string }>`
  display: flex;
  flex-direction: column-reverse;
  .ant-statistic-title {
    color: var(${props => colors[props.$type as Type].text});
    font-size: var(--acx-body-5-font-size);
    min-height: 24px;
    margin-bottom: 0px;
  }
  .ant-statistic-content {
    color: var(${props => colors[props.$type as Type].text});
    .ant-statistic-content-value {
      font-size: 23px;
      font-weight: var(--acx-body-font-weight-bold);
    }
    .ant-statistic-content-suffix {
      font-size: var(--acx-body-3-font-size);
    }
  }
`
export const Divider = styled(AntDivider)<{ $color: string }>`
  background-color: var(${props => colors[props.$color as Type].text});
  height: 90%;
`
