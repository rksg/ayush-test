import {
  Space,
  List,
  Button
} from 'antd'
import styled from 'styled-components/macro'

import { LayoutUI, Drawer as AntdDrawer } from '@acx-ui/components'
import { LogOut as AntdLogOut }           from '@acx-ui/icons'


export const UserNameButton = styled(LayoutUI.ButtonSolid)`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: var(--acx-headline-5-font-weight-bold);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
`

export const SpaceBetween = styled(Space)`
  justify-content: space-between;
  width: 100%;
`

export const FilterRow = styled(SpaceBetween)`
  margin-bottom: 5px;
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

export const LogOut = styled(AntdLogOut)`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`

export const Drawer = styled(AntdDrawer)`
  .ant-drawer-body {
    overflow-x: hidden;
  }
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

export const RegionBtnWrapper = styled.div`
  padding: 0px 10px 0px 10px;
`
