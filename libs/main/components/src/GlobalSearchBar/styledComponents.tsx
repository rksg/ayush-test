import { Input as AntInput } from 'antd'
import styled                from 'styled-components/macro'

import { LayoutUI }     from '@acx-ui/components'
import {
  SendMessageOutlined
}                          from '@acx-ui/icons'

export const Home = styled(LayoutUI.DropdownText)`
  color: var(--acx-primary-white);
`

export const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 100%;
  max-width:400px;
  min-width:255px;
  height: 32px;
  background: var(--acx-neutrals-70);
  border-radius: 20px;
`
export const Input = styled(AntInput)`
  height: 28px;
  font-size: 12px;
  color: ${props => props.value === '' ? 'var(--acx-neutrals-50)' : 'var(--acx-primary-white)'};
  background: transparent;
  border: none;
  .ant-input::placeholder {
    color: var(--acx-neutrals-50);
  }
`
export const SendSearch = styled(SendMessageOutlined)`
  cursor: pointer;
  margin-right: 5px;
  path {
    stroke: var(--acx-neutrals-50);
  }
  :hover {
    path {
      stroke: var(--acx-primary-white);
    }
  }
`
export const SearchSolid = styled(LayoutUI.ButtonSolid)`
  &&& {
    border: none;
    cursor: default;
    > svg path {
      stroke: var(--acx-primary-white);
    }
    background-color: var(--acx-accents-orange-55);
    :hover, &:focus {
      background-color: var(--acx-accents-orange-55);
    }
  }
`

export const Divider = styled(LayoutUI.Divider)`
  border-right: 1px solid var(--acx-neutrals-60);
`

export const Close = styled(LayoutUI.ButtonOutlined)`
  &&& {
    margin-left: -5px;
    > svg path {
      stroke: var(--acx-neutrals-50);
    }
    border: none;
    background: transparent;
    :hover, &:focus {
      background: transparent;
      > svg path {
        stroke: var(--acx-primary-white);
      }
    }
  }
`

export const RegionWrapper = styled.div`
  padding: 0px 10px 0px 10px;
`
