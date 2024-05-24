import {
  Checkbox as AntCheckbox,
  List as AntList
} from 'antd'
import styled from 'styled-components/macro'

export const Checkbox = styled(AntCheckbox)`
  padding-right: 5px;
`

export const List = styled(AntList)`
  .ant-list-split .ant-list-item {
    border-bottom: 0px;
  }

  .ant-list-item {
    border-bottom: 0px;
  }
`

export const SectionTitle = styled.div`
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  margin-top: var(--acx-descriptions-space);
`
