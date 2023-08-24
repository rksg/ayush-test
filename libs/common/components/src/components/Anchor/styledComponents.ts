import { Anchor as AntAnchor, Col } from 'antd'
import styled, { css }              from 'styled-components/macro'

export const Anchor = styled(AntAnchor)<{ $customType?: string }>`
  ${props => props.$customType === 'layout' ? css`
  &.ant-anchor-wrapper {
    background-color: var(--acx-neutrals-10);
    border-radius: 4px;
    margin-left: -2px;
    padding-left: 2px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .ant-anchor-ink-ball {
    display: inline-block;
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
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
  .ant-anchor-link-active > .ant-anchor-link-title {
    font-weight: var(--acx-subtitle-5-font-weight);
  }
  ` : `
  .ant-anchor-ink-ball {
    display: none;
  }
  `}

  .ant-anchor-ink:before {
    display: none;
  }
  .ant-anchor-link-title {
    font-size: var(--acx-subtitle-5-font-size);
    line-height: var(--acx-subtitle-5-line-height);
  }
`
export const AnchorLayoutSidebar = styled(Col)`
  > div > [aria-hidden] + .ant-affix {
    position: fixed;
    top: calc(
      var(--acx-header-height) +
      var(--acx-content-vertical-space) +
      var(--acx-pageheader-height) +
      var(--acx-cartablist-height) +
      (var(--acx-cloudmessagebanner-height) * var(--acx-has-cloudmessagebanner))
    ) !important;
  }
`

export const Container = styled.div`
  margin: 12px 0 48px;
  &:last-child{
    min-height: 100vh;
  }
`
