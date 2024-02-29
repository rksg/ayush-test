import styled from 'styled-components/macro'

import { CheckMarkCircleSolid, InformationSolid } from '@acx-ui/icons'

import { EdgeClusterTypeCardProps } from '.'

export const CheckMarkIcon = styled(CheckMarkCircleSolid)`
  width: 16px;
  height: 16px;
  path:nth-child(1) {
    fill: var(--acx-accents-orange-50);
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-50);
  }
`
export const InformationSolidIcon = styled(InformationSolid)`
  color: var(--acx-semantics-yellow-50);
`

export const IconWrapper = styled.div`
  & svg {
    width: 38px;
    height: 38px;
  }
`

type WrapperProps = Pick<EdgeClusterTypeCardProps, 'showSelected'> & {
  hasWarning: boolean
}
export const Wrapper = styled.div<WrapperProps>`
  width: 223px;
  height: 142px;
  max-height: 142px;

  .ant-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    padding: 12px 16px;
    border: 1px solid var(--acx-neutrals-20);
    box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
  }

  &:hover .ant-card, &:focus .ant-card, &:active .ant-card {
    border-width: 2px;
    border-color: var(--acx-accents-orange-50);
  }

  .ant-card-head {
    padding: 0;
    border-bottom: none;
    min-height: 0;
    margin: 0px;
  }
  .ant-card-head-title {
    padding: 0;
    .ant-space {
      // icon
      .ant-space-item:last-child {
        line-height: 0;
      }
    }
  }
  .ant-card-head-wrapper {
    align-items: start;
  }
  .ant-card-extra {
    padding: 0;
    display: flex;
  }
  .ant-card-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 0
    font-size: var(--acx-body-3-font-size);
    line-height: var(--acx-body-3-line-height);
    ${(props) => (props.showSelected
    ? 'padding-top: 5px;'
    : 'padding-top: calc(16px + 5px);' )}
    ${(props) => (props.hasWarning
    ? ''
    : 'padding-bottom: 1.33em;')}
  }
  .ant-card-actions {
    padding: 0;
    border-top: none;
    min-height: 1.33em;
    &::before {
      display: none;
    }
    &::after {
      display: none;
    }

    & li {
      margin: 0;
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;

      & span {
        min-width: unset;
        display: flex;
      }
    }
  }
`

export const Title = styled.div`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
  text-align: center;
`