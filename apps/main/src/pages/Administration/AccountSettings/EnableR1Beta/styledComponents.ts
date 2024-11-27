import {
  Checkbox as AntCheckbox,
  Switch,
  Typography
} from 'antd'
import styled from 'styled-components/macro'

import { SpaceWrapper } from '@acx-ui/rc/components'


export const Wrapper = styled.div`
  .description {
    padding: 12px;
    background-color: var(--acx-neutrals-15);
  }

  .ant-table-tbody > tr > td.ant-table-cell {
    word-break: break-word;
  }
`

export const Spacer = styled.div`
  height: var(--acx-descriptions-space);
`
export const DrawerContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
export const DrawerContent = styled.div`
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-3-line-height);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
  margin-top: 0;
`
export const FeatureTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`
export const FeatureTitle = styled(Typography.Text)`
  font-weight: 800;
  font-size: var(--acx-headline-4-font-size);
`
export const FeatureDescription = styled(Typography.Paragraph)`
  font-size: 13px;
  width: 85%;
`
export const Checkbox = styled(AntCheckbox)`
  padding-right: 5px;
`
export const FooterMsg = styled.div`
  color: var(--acx-neutrals-60);
  align-self: center;
`
export const List = styled.li`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-headline-4-font-weight);
  font-style: normal;
  font-size: var(--acx--body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  display: inline-block;
  width: 100%;
`

export const ListWrapper = styled.div`
padding: var(--acx-content-vertical-space);
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-3-line-height);

 .ant-list-item-meta-avatar {
    margin-top: 0px;
    margin-right: 9px;
    margin-left: -11px;
  }

  .ant-list-split .ant-list-header {
    border-bottom: 0px;
  }

  .ant-list {
    padding-bottom: 14px;
  }

  .ant-list-header {
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-headline-5-font-weight-bold);
    font-size: var(--acx-subtitle-4-font-size);
    line-height: 19px;
    padding-left: 0px;
    padding-top: 0px;
    padding-bottom: 15px;
  }

  .ant-list-item {
    margin-top: 0px;
    padding-top: 0px;
    padding-bottom: 10px;
    padding-left: 0px;
    border-bottom: 0px;
    height: auto;
    & .ant-list-item-meta {
      margin-bottom: 0px;
    }
  }

  .ant-list-item-meta-title {
    margin-bottom: 0px;
    width: 100%;
    > a {
      color: var(--acx-accents-blue-50);
      line-height: var(--acx-headline-4-line-height);
      font-weight: var(--acx-headline-4-font-weight);
      font-size: var(--acx-headline-5-font-size);
  }

  }
  .ant-list-item-meta > h4 {
    width: 100%
  }
`

export const FooterWrapper = styled.div<{ editMode?: boolean }>`
  display: flex;
  flex-direction: ${(props) => props.editMode ? 'row' : 'column' };
  align-items: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  ${(props) => props.editMode ? 'justify-content: space-between' : 'gap: 20px' };
`

export const ButtonFooterWrapper = styled.div<{ editMode?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  ${(props) => props.editMode ? '' : 'width: 100%' } ;
`

export const EarlyAccessFeatureSwitch = styled(Switch)`
  height: 18px;
  width: 54px;
  border-color: var(--acx-neutrals-60) !important;
  background-color: ${(props) => props.checked ? 'var(--acx-semantics-green-60) !important'
    : 'var(--acx-neutrals-50) !important' };
  .ant-switch-inner {
    color: var(--acx-primary-white);
  }
  .ant-switch-handle::before {
    background: var(--acx-primary-white) !important;
  }
`
export const IconCheckboxWrapper = styled(SpaceWrapper)`
  .ant-checkbox {
    top: 3px;
  }
  .ant-row {
    position: relative;
    top: 3px;
  }
`
