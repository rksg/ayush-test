import {
  Space,
  List,
  Button
} from 'antd'
import styled from 'styled-components/macro'

import { Drawer as AntdDrawer } from '@acx-ui/components'
import {
  WarningCircleSolid,
  WarningTriangleSolid,
  CheckMarkCircleSolid
} from '@acx-ui/icons'

export const SpaceBetween = styled(Space)`
  justify-content: space-between;
  width: 100%;
`

export const FilterRow = styled(SpaceBetween)`
  margin-bottom: 5px;
`

export const Meta = styled(List.Item.Meta)`
  .ant-list-item-meta-avatar {
    margin-right: 10px;
    flex: 1;
  }
  .ant-list-item-meta-content{
    flex: 10;
  }
  .ant-list-item-meta-title,
  .ant-list-item-meta-description {
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
`
export const WarningCircle = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`

export const WarningTriang = styled(WarningTriangleSolid)`
  path:nth-child(1) {
    fill: var(--acx-accents-orange-30);
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-30);
  }
`

export const EmptyLink = styled.span`
  color: var(--acx-accents-blue-50);
`
export const ListTime = styled(SpaceBetween)`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-60);
`
export const ListTable = styled(List)`
  .ant-list-pagination {
    margin: 16px 0;
    text-align: center;
  }
`
export const ListItem = styled(List.Item)`
  border-bottom: 0 !important;
  .ant-list-item-action {
    margin-left: 10px;
  }
`
export const AcknowledgeCircle = styled(CheckMarkCircleSolid)`
  path:nth-child(1) {
    fill: var(--acx-neutrals-30);
  }
  path:nth-child(3) {
    stroke: var(--acx-neutrals-30);
  }
  :hover {
    path:nth-child(1) {
      fill: var(--acx-semantics-green-60);
    }
    path:nth-child(3) {
      stroke: var(--acx-semantics-green-60);
    }
  }
`

export const ClearButton = styled(Button)`
  border: none;
  .anticon{
    font-size: 18px;
  }
`

export const Drawer = styled(AntdDrawer)`
  .ant-drawer-body {
    overflow-x: hidden;
  }
`