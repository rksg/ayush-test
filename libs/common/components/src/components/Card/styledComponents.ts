import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'

import { ArrowsOut, MoreVertical } from '@acx-ui/icons'

type WrapperProps = {
  hasBorder: boolean
  hasTitle: boolean
  hasSubTitle: boolean
  hasTabs: boolean
}

export const ArrowOutIcon = styled(ArrowsOut)``
export const MoreVerticalIcon = styled(MoreVertical)``

export const Button = styled(AntButton)`
  border: none;
  box-shadow: none;
  background: var(--acx-primary-white);
  padding: 0;
  &.ant-btn-icon-only {
    width: 16px;
    height: 16px;
  }
`

export const Wrapper = styled.div<WrapperProps>`
  height: 100%;
  width: 100%;
  .ant-card {
    height: 100%;
    display:flex;
    flex-direction:column;
    ${(props) => (props.hasBorder ? `
      padding: 12px 16px;
      border: 1px solid var(--acx-neutrals-20);
      border-radius: 8px;
      box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
    ` : '')}
  }
  .ant-card-head {
    padding: 0;
    border-bottom: none;
    min-height: 0;
    margin-bottom: 10px;
    ${(props) => (props.hasTitle || props.hasTabs ? '' : 'display:none;')}
  }
  .ant-card-head-title {
    padding: 0;
  }
  .ant-card-head-wrapper {
    align-items: start;
  }
  .ant-card-extra {
    padding: 0;
  }
  .ant-card-body {
    display: flex;
    flex-grow: 1;
    padding: 0;
  }
`

export const HeaderContainer = styled.div<WrapperProps>`
  line-height: 16px;
  display: grid;
  grid-template-areas: ${(props) => props.hasSubTitle
    ? `
      "title tabs"
      "sub-title sub-title";
    `
    : '"title tabs";'}
  grid-template-columns: auto 1fr;
  column-gap: ${(props) => (!props.hasTitle && props.hasTabs ? '0px' : '20px')};
  row-gap: 5px;
`

export const TitleWrapper = styled.div`
  grid-area: title;
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
  height: var(--acx-headline-4-line-height);
`

export const SelectionControlWrapper = styled.div`
  grid-area: tabs;
  height: var(--acx-headline-4-line-height);
`

export const SubTitleWrapper = styled.div`
  grid-area: sub-title;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-body-font-weight);
  height: var(--acx-body-5-line-height);
`
