import { Modal,
  List,
  Button,
  Typography
} from 'antd'
import styled from 'styled-components/macro'

import { LayoutUI, GridRow, GridCol, Drawer as AntdDrawer }               from '@acx-ui/components'
import { WarningCircleSolid, CheckMarkCircleSolid, LogOut as AntdLogOut } from '@acx-ui/icons'


type CopyableTextProps = {
  color?: string
}

export const UserNameButton = styled(LayoutUI.ButtonSolid)`
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    font-family: 'Roboto';
    font-size: 14px;
`

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

export const AboutModal = styled(Modal)`
  .ant-modal-content {
    background: var(--acx-neutrals-80);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    border-radius: 8px;
  }
`

export const CopyableText = styled(Typography.Paragraph)
  .attrs({ copyable: true })<CopyableTextProps>`
  margin-bottom: 3px !important;
  color: ${(props) => (props.color ? props.color : 'var(--acx-accents-blue-50)')};
`

export const WarningCircle = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`
export const ListTable = styled(List)`
  .ant-list-pagination {
    text-align: center;
  }
`
export const ListItem = styled(List.Item)`
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

export const VersionContainer = styled.div`
  font-weight: 400;
  font-family: Source Sans Pro;
  font-style: normal;
  font-size: 10px;
  color: var(--acx-neutrals-40)
`

export const ClearButton = styled(Button)`
  border: none;
  .anticon{
    font-size: 18px;
  }
`

export const Meta = styled(List.Item.Meta)`
  .ant-list-item-meta-avatar{
    margin-right: 10px;
  }
`
export const DeviceLink = styled.span`
  color: var(--acx-accents-blue-50)
`
export const LogOut = styled(AntdLogOut)`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`
export const Drawer = styled(AntdDrawer)`
  .ant-drawer-body{
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
export const ActiveButton = styled(LayoutUI.ButtonSolid)`
  background: var(--acx-neutrals-80) !important;
  color: var(--acx-neutrals-60) !important;
`
