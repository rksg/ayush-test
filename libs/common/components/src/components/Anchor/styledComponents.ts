import { Anchor as AntAnchor } from 'antd'
import styled                  from 'styled-components/macro'

export const Anchor = styled(AntAnchor)`
  &.ant-anchor-wrapper {
    background-color: var(--acx-neutrals-10);
    border-radius: 4px;
    margin-left: -2px;
    padding-left: 2px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .ant-anchor-ink:before {
    display: none;
  }
  .ant-anchor-ink-ball {
    height: 20px;
    margin-top: -6px;
    border-width: 1px;
    border-radius: 0;
    width: 3px;
    background-color: var(--acx-accents-orange-50);
  }
  .ant-anchor-link {
    padding: 10px 0 10px 16px;
    > .ant-anchor-link {
      padding: 15px 0 0px 16px;
    }
  }
  .ant-anchor-link-title {
    color: var(--acx-primary-black);
    font-size: var(--acx-subtitle-5-font-size);
    line-height: var(--acx-subtitle-5-line-height);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
  .ant-anchor-link-active > .ant-anchor-link-title {
    font-weight: var(--acx-subtitle-5-font-weight);
  }
`

export const Container = styled.div`
  min-height: 100vh;
`
