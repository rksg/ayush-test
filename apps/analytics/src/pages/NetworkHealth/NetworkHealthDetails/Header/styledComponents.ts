import { Menu as AntMenu } from 'antd'
import styled              from 'styled-components/macro'

export const Menu = styled(AntMenu)`
  .ant-dropdown-menu-item:hover{
    background-color: transparent;
  }
  height: 210px;
  overflow-y: scroll;
`
export const ButtonTitleWrapper = styled.span`
  color: var(--acx-neutrals-60);
`
