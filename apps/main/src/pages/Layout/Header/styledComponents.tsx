import { ExportOutlined, CheckCircleFilled } from '@ant-design/icons'
import { Popover as AntPopover,
  PopoverProps,
  Modal,
  List,
  Button,
  Typography
} from 'antd'
import styled from 'styled-components/macro'

import { LayoutUI, GridRow, GridCol } from '@acx-ui/components'
import { WarningCircleSolid, LogOut as AntdLogOut } from '@acx-ui/icons'


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

export const Popover = styled(AntPopover)`
  &.ant-popover
  > .ant-popover-content
    > .ant-popover-arrow {
      display: none;
    }
    > .ant-popover-inner-content {
      padding: 0px;
    }
  }
`

const CustomPopover = ( props:PopoverProps ) => (
  <Popover overlayClassName={props.className}
    getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
    {...props} >
    {props.children}
  </Popover>
)

export const StyledPopover = styled(CustomPopover)`
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 0px;
  }
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
export const LinkItem = styled(GridRow)<{ paddingTop?: string }>`
  padding: ${props => `${props.paddingTop||0}px 25px 0px 25px`};
  display: flex;
  margin-left: 0px !important;
  margin-right: 0px !important;
  align-items: end;
  :hover {
    background-color: var(--acx-accents-orange-10);
  }
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

export const MenuIcon = styled(ExportOutlined)`
  font-size: 17px;
  color: var(--acx-primary-black)
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
export const ListItem = styled(List.Item)`
    .ant-list-item-action {
      margin-left: 10px;
    }
`
export const AcknowledgeCircle = styled(CheckCircleFilled)`
  color: var(--acx-neutrals-30);
  :hover {
    color: var(--acx-semantics-green-60);
    border: none;
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
