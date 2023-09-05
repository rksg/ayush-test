import styled from 'styled-components'

import { GridCol } from '@acx-ui/components'

export const List = styled.li`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-headline-4-font-weight);
  font-style: normal;
  font-size: var(--acx--body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const StyledGridCol = styled(GridCol)`
  background: var(--acx-neutrals-10);
  margin-top: var(--acx-content-vertical-space);
`

export const ListWrapper = styled.div`
  .ant-list-item-meta-avatar {
    margin-top: 3px;
    margin-right: 6px;
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
    padding-left: 15px;
    padding-top: 14px;
    padding-bottom: 15px;
  }

  .ant-list-item {
    padding-top: 0px;
    padding-bottom: 0px;
    border-bottom: 0px;
    height: auto;
    & .ant-list-item-meta {
      margin-bottom: 0px;
    }
  }

  .ant-list-item-meta-title {
    margin-bottom: 0px;
    > a {
      color: var(--acx-accents-blue-50);
      line-height: var(--acx-headline-4-line-height);
      font-weight: var(--acx-headline-4-font-weight);
      font-size: var(--acx-headline-5-font-size);
  }
`