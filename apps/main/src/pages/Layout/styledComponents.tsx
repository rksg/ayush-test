import { Input as AntInput, ButtonProps } from 'antd'
import styled                             from 'styled-components/macro'

import {
  LayoutUI,
  Button
}                        from '@acx-ui/components'
import {
  SendMessageOutlined,
  BulbSolid,
  BulbOffSolid,
  WarningCircle
}                          from '@acx-ui/icons'

export const Home = styled(LayoutUI.DropdownText)`
  color: var(--acx-primary-white);
  margin-right:10px;
`

export const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  width: 400px;
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
export const SearchSolid = styled(Button)`
  border: none;
  cursor: default;
  > svg path {
    stroke: var(--acx-primary-white);
  }
  background-color: var(--acx-accents-orange-55);
  :hover, &:focus {
    background-color: var(--acx-accents-orange-55);
  }
`

export const Divider = styled(LayoutUI.Divider)`
  border-right: 1px solid var(--acx-neutrals-60);
`
export const Close = styled(Button)`
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
`

export const LeftHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
`


export const LicenseContainer = styled.div.attrs((props: { expired: boolean }) => props)`
  display: flex;
  background-color: ${props => props.expired ?
    'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);' }
  height: 45px;
  align-items: center;
  border-radius: 4px;
  padding-left: 5px;
`
export const LicenseIconWrapper = styled.div`
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
`

export const TipsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 20px;
  align-items: start;
  white-space: nowrap;
  margin-right: 10px;
`


export const MainTips = styled.div.attrs((props: { expired: boolean }) => props)`
  height: 20px;
  color: var(--acx-primary-white);
  font-weight: ${props => props.expired ?
    'var(--acx-subtitle-5-font-weight);':'var(--acx-headline-5-font-weight);' }
`
export const SubTips = styled.div.attrs((props: { expired: boolean }) => props)`
  color: ${props => props.expired ? 'var(--acx-primary-white);':'var(--acx-accents-orange-50);'}
  font-weight: ${props => props.expired ?
    'var(--acx-headline-5-font-weight);':'var(--acx-subtitle-5-font-weight);' }
`

export const ActiveBtn = styled(Button).attrs({ type: 'link' })<
ButtonProps & { expired?: boolean }
>`
  height: 20px;
  color: ${props => props.expired ?
    'var(--acx-primary-white);':'var(--acx-accents-orange-50);' }
  font-weight: var(--acx-subtitle-5-font-weight);
`

export const LayoutIcon = styled(LayoutUI.Icon)`
    align-items: center;
    display: flex;
`

export const BulbLesserInitial = styled(BulbOffSolid)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-orange-50);
  }
`

export const BulbLesser7 = styled(BulbSolid)`
  width: 16px;
  height: 16px;
  path:nth-child(1){
    stroke: var(--acx-accents-orange-50);
    fill: var(--acx-accents-orange-50);
  }
  path:nth-child(2){
    stroke: var(--acx-accents-orange-50);
  }
  path:nth-child(3){
    stroke: var(--acx-accents-orange-50);
  }
`
export const BulbGrace = styled(BulbOffSolid)`
  width: 16px;
  height: 16px;
  fill: var(--acx-primary-white);
`

export const Expired = styled(WarningCircle)`
  width: 24px !important;
  height: 24px !important;
  display: inline-block;
  path:nth-child(1) {
    stroke: var(--acx-accents-orange-55);
  }
  path:nth-child(2) {
    fill: var(--acx-primary-white);
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-55);
  }
  path:nth-child(4) {
    fill: var(--acx-accents-orange-55);
    stroke: var(--acx-accents-orange-55);
  }
`
