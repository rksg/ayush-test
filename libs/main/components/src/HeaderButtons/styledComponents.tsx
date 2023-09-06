import {
  Space,
  List,
  Button
} from 'antd'
import styled from 'styled-components/macro'

import { LayoutUI, GridRow, GridCol, Drawer as AntdDrawer } from '@acx-ui/components'
import {
  WarningCircleSolid,
  WarningTriangleSolid,
  CheckMarkCircleSolid,
  CancelCircleSolid
} from '@acx-ui/icons'


export const RowWrapper = styled.div`
  padding: 20px;
  background: var(--acx-neutrals-20);
  display: flex;
  justify-content: center;
`

export const Description = styled.div`
  color: var(--acx-neutrals-70);
  margin-top: 4px;
  font-size: var(--acx-subtitle-5-font-size);
`
export const MenuLink = styled.div`
  color: var(--acx-neutrals-80);
  font-size: var(--acx-subtitle-5-font-size);
`

export const MenuRowContainer = styled(GridRow)`
  padding: 25px 25px 0px 25px;
  margin-left: 0px !important;
  margin-right: 0px !important;
  :hover {
    background-color: var(--acx-accents-orange-10);
  }
`

export const LinkCol = styled(GridCol).attrs({ col: { span: 5 } })`
  align-items: flex-start;
  `

export const SearchRow = styled(GridRow)`
  width: 100%;
  align-items: center;
  display: flex;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
  background: var(--acx-neutrals-10);
`

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

export const ContactContainer = styled.div`
  font-weight: 400;
  font-family: Open Sans;
  font-style: normal;
  font-size: 10px;
  color: var(--acx-primary-white)
`
export const VersionNameContainer = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--acx-primary-white);
`
export const DisabledButton = styled(LayoutUI.ButtonSolid)`
  color: var(--acx-neutrals-60) !important;
  background-color: var(--acx-neutrals-70);
`

export const LinkButton = styled(Button)`
  font-weight: var(--acx-body-font-weight-bold);
`

export const ActivityItem = styled(List.Item)`
  border-bottom: 0 !important;
  .ant-list-item-action {
    margin-left: 10px;
  }
  :hover {
    cursor: pointer;
  }
`

export const ActivityMeta = styled(List.Item.Meta)`
  .ant-list-item-meta-avatar {
    margin-right: 0px;
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

export const RedCancelCircle = styled(CancelCircleSolid)`
  path:nth-child(1) {
    fill: var(--acx-semantics-red-50);
  }
`
