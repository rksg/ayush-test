import { Badge as AntBadge } from 'antd'
import styled                from 'styled-components'

const colors = [
  '--acx-semantics-yellow-30',
  '--acx-semantics-yellow-60',
  '--acx-semantics-red-60'
]

const optimizedColors = [
  '--acx-semantics-green-60',
  '--acx-semantics-red-60'
]

export const Wrapper = styled.div`
  height: auto;
  margin-block: 20px;
`

export const TitleBadge = styled.span`
  color: var(--acx-primary-white);
  background-color: var(--acx-accents-orange-50);
  border-radius: 15px;
  padding-inline: 6px;
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const Detail = styled.div`
  padding-bottom: 11px;
  padding-top: 5px;
  border-bottom: 1px solid var(--acx-neutrals-20);
`

export const Badge = styled(AntBadge)`
  .ant-badge-status-dot {
    width: 12px;
    height: 12px;
  }
`

export const PriorityIcon = styled.span.attrs((props: { value: number }) => props)`
  display: flex;
  margin-right: 5px;
  margin-top: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(${props => colors[props.value]});
`

export const OptimizedIcon = styled.span.attrs((props: { value: number }) => props)`
  display: flex;
  margin-right: 5px;
  margin-top: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(${props => optimizedColors[props.value]});
`

export const Subtitle = styled.div`
  padding-left: 15px;
  font-size: var(--acx-body-6-font-size);
  color: var(--acx-neutrals-50);
  line-height: 1.1;
`
