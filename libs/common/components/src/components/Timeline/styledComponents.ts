import styled, { css } from 'styled-components/macro'

import {
  CancelCircleSolid,
  CheckMarkCircleSolid,
  Pending,
  InProgress
}                         from '@acx-ui/icons'
import { TimelineStatus } from '@acx-ui/types'

const getStatusColor = (status: TimelineStatus) => {
  switch(status){
    case 'SUCCESS':
      return 'var(--acx-semantics-green-50)'
    case 'FAIL':
      return 'var(--acx-semantics-red-50)'
    case 'PENDING':
    case 'INPROGRESS':
      return 'var(--acx-neutrals-60)'
  }
}

export const Wrapper = styled.div`
  .ant-timeline-item {
    padding: 0px;
  }
  .ant-timeline-item:nth-child(3n+3) {
    padding-top: 6px;
    padding-bottom: 16px;
  }
  .ant-timeline-item-tail {
    display: none;
    height: 100%;
    top: 5px;
    border: solid 1px var(--acx-accents-orange-50);
  }
  .ant-timeline-item-content {
    margin-left: 0;
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
  }
  .ant-timeline-item-head-custom {
    display: none;
    background: transparent;
    top: 3px;
  }
  .ant-descriptions-item-container {
    padding-bottom: 15px;
  }
  .ant-descriptions-item-content {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    font-weight: var(--acx-body-font-weight-bold);
    color: var(--acx-primary-black);
  }
  .ant-descriptions-item-label {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    font-weight: var(--acx-body-font-weight-bold);
    color: var(--acx-neutrals-60);
  }
`

export const ItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 106px auto;
`

export const ContentWrapper = styled.div`
  margin: -34px 4px 0px 30px;
`

export const StatusWrapper = styled.div<{ status: TimelineStatus }>`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight-bold);
  color: ${(props) => getStatusColor(props.status)};
`

const stepStyle = {
  previous: css`
    --dot-size: calc(var(--size) / 2);
    width: var(--dot-size);
    height: var(--dot-size);
  `,
  current: css`
    --dot-size: calc(var(--size) - 1px);
    width: var(--dot-size);
    height: var(--dot-size);
  `,
  future: css`
    --dot-size: 0;
    width: var(--dot-size);
    height: var(--dot-size);
  `
}
export const Step = styled.div<{ $state: 'previous' | 'current' | 'future' }>`
  --size: 8px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  border: 1px solid var(--acx-accents-orange-50);
  background-color: var(--acx-primary-white);

  position: relative;
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    background-color: var(--acx-accents-orange-50);
    border-radius: 50%;

    ${props => stepStyle[props.$state]}
  }
`

export const DescriptionWrapper = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  margin-left: 30px;
`

export const WithExpanderWrapper = styled.div`
  display: grid;
  grid-template-columns: auto min-content;
`

export const ExpanderWrapper = styled.div`
  display: flex;
  align-items: center;
  svg {
    width: 16.5;
    height: 16.5;
    rect {
      fill: var(--acx-accents-blue-50);
    }
    path {
      stroke: var(--acx-primary-white);
    }
  }
`
export const SuccessIcon = styled(CheckMarkCircleSolid)`
path:nth-child(1) {
  fill: var(--acx-semantics-green-50);
}
path:nth-child(3) {
  stroke: var(--acx-semantics-green-50);
}
`
export const FailIcon = styled(CancelCircleSolid)`
  path:nth-child(1) {
    fill: var(--acx-semantics-red-50);
  }
  path:nth-child(2) {
    stroke: var(--acx-semantics-red-50);
  }
`
export const PendingsIcon = styled(Pending)`
  circle {
    fill: var(--acx-neutrals-60);
    stroke: var(--acx-neutrals-60);
  }
`
export const InProgressIcon = styled(InProgress)`
  circle {
    fill: var(--acx-neutrals-60);
    stroke: var(--acx-neutrals-60);
  }
`

export const Dash = styled.div`
  margin-left: 50px;
  border-left: 1px solid var(--acx-neutrals-50);
  height: 8px;
`
