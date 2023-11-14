import {
  Checkbox as AntCheckbox,
  List as AntList
} from 'antd'
import styled from 'styled-components/macro'


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
  padding: var(--acx-content-vertical-space);
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-3-line-height);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
  margin-top: 0;
  border: 1px solid #cccccc;
`
export const Checkbox = styled(AntCheckbox)`
  padding-right: 5px;
`
export const FooterMsg = styled.div`
  color: var(--acx-neutrals-60);
  padding-bottom: var(--acx-content-vertical-space);
`

export const List = styled(AntList)`
  .ant-list-split .ant-list-item {
    border-bottom: 0px;
  }

  .ant-list-item {
    border-bottom: 0px;
  }

  > span > div {
    display: inline-block;
    float: left;
  }
`

export const Meta = styled(List.Item.Meta)`
  float: left;
  display: inline-block;
`

export const ListWrapper = styled.div`
  padding: 0px 5px;
  .ant-list-item {
    display: inline-block !important;
    }

 > div.ant-list-item-meta {
  float: left;
 }

  .ant-list-split .ant-list-item {
    border: none;
  }

  .ant-list-sm .ant-list-item {
    padding: 8px 16px;
    display: inline-block ;
  }
`


export const SectionTitle = styled.div`
  font-weight: var(--acx-subtitle-6-font-weight-bold);
`

export const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
`

export const ButtonFooterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 100%;
`
