import { Tabs as AntTabs, TabsProps }              from 'antd'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'

import type { TabsType } from '.'

const lineStyle = css`
  > .ant-tabs-nav {
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
  > .ant-tabs-nav {
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
  margin-top: 16px;
  > .ant-tabs-nav {
    border: 0;
    &:before { border: 0; }
    > .ant-tabs-nav-wrap > .ant-tabs-nav-list {
      > .ant-tabs-ink-bar {
        height: 2px;
        top: 0;
      }
      > .ant-tabs-tab {
        padding: 6px 29.5px;
        background: var(--acx-neutrals-20);

        & + .ant-tabs-tab { margin-left: 12px; }
        > .ant-tabs-tab-btn {
          font-size: var(--acx-body-4-font-size);
          line-height: var(--acx-body-4-line-height);
          font-weight: var(--acx-body-font-weight);
          text-shadow: none;
        }
        &.ant-tabs-tab-active {
          background: transparent;
          color: var(--acx-primary-black);
          > .ant-tabs-tab-btn { font-weight: var(--acx-subtitle-5-font-weight-semi-bold); }
        }
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
