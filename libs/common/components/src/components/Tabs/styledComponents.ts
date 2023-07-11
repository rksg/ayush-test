import { Tabs as AntTabs, TabsProps }              from 'antd'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'

import type { TabsType } from '.'

const lineStyle = css`
  &.ant-tabs-top > .ant-tabs-nav {
    &:before { border: 0; }
    border-bottom: 1px solid var(--acx-neutrals-30);
    > .ant-tabs-nav-wrap > .ant-tabs-nav-list {
      > .ant-tabs-ink-bar { height: 3px; }
      > .ant-tabs-tab {
        padding: 16px 8px 11px;

        &.ant-tabs-tab-active .ant-tabs-tab-btn {
          font-size: var(--acx-subtitle-4-font-size);
          font-weight: var(--acx-subtitle-4-font-weight);
          line-height: var(--acx-subtitle-4-line-height);
          text-shadow: none;
        }

        & + .ant-tabs-tab { margin-left: 20px; }
      }
    }
  }
`

const cardStyle = css`
  &.ant-tabs-top > .ant-tabs-nav {
    padding-left: 15px;
    &:before { border-bottom: 1px solid var(--acx-accents-orange-50); }
    > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
      padding: 9.5px 18.5px;
      background: transparent;
      border-color: transparent;
      border-radius: 0;
      & + .ant-tabs-tab { margin-left: 20px; }
      > .ant-tabs-tab-btn {
        font-size: var(--acx-subtitle-4-font-size);
        line-height: var(--acx-subtitle-4-line-height);
      }
      &.ant-tabs-tab-active {
        border-color: var(--acx-accents-orange-50);
        border-bottom-color: var(--acx-primary-white);
        > .ant-tabs-tab-btn {
          font-weight: var(--acx-subtitle-4-font-weight);
          color: var(--acx-accents-orange-50);
          text-shadow: none;
        }
      }
    }
  }
`

const thirdStyle = css`
  > .ant-tabs-content-holder{
    border: 0;
  }
  > .ant-tabs-nav {
    .ant-tabs-ink-bar {
      display: none;
    }
    > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
      border: 1px solid var(--acx-neutrals-30);
      > .ant-tabs-tab-btn {
        font-size: var(--acx-body-4-font-size);
        line-height: var(--acx-body-4-line-height);
        font-weight: var(--acx-body-font-weight);
        text-shadow: none;
      }
      &.ant-tabs-tab-active {
        z-index: 1;
        border-color: var(--acx-accents-orange-50);
        > .ant-tabs-tab-btn {
          color: var(--acx-accents-orange-50);
        }
      }
    }
  }
  :not(.ant-tabs-left, .ant-tabs-right) > .ant-tabs-nav {
    margin-top: 16px;
    border: 0;
    &:before { border: 0; }
    > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
      padding: 6px 30px;
      margin: 0 -1px 0 0;
      &.ant-tabs-tab-active {
        z-index: 1;
      }

      &:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }
      &:nth-last-child(-n+2) {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }
`

const styles: Record<TabsType, FlattenSimpleInterpolation> = {
  line: lineStyle,
  card: cardStyle,
  third: thirdStyle
}

export const Tabs = styled(AntTabs)<
  TabsProps & { $type: TabsType }
>`${props => styles[props.$type]}`
