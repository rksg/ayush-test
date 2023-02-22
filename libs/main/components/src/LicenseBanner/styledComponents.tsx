import { ButtonProps } from 'antd'
import styled          from 'styled-components/macro'

import {
  LayoutUI,
  Button
}                        from '@acx-ui/components'
import {
  BulbSolid,
  BulbOffSolid,
  WarningCircle,
  CaretDownSolid
}                          from '@acx-ui/icons'

export const LicenseContainer = styled.div`
  background-color: var(--acx-neutrals-90);
  display: flex;
  align-items: flex-start;
  border-radius: 4px;
  flex-direction: column;
  border: 1px solid var(--acx-accents-orange-55);
  position: absolute;
  top: 8px;
`
export const LicenseContainerSingle = styled.div.attrs((props: { expired: boolean }) => props)`
  display: flex;
  background-color: ${props => props.expired ?
    'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);' }
  height: 40px;
  align-items: center;
  border-radius: 4px;
  padding-left: 5px;
`
export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const LicenseIconWrapper = styled.div`
  width: 45px;
  display: flex;
  align-self: center;
  justify-content: center;
  padding: 0px 18px 0px 18px;
`

export const TipsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 16px;
  align-items: start;
  white-space: nowrap;
  margin-right: 10px;
`


export const MainTips = styled.div.attrs((props: { expired: boolean }) => props)`
  height: 16px;
  color: var(--acx-primary-white);
  font-size: 12px;
  font-weight: ${props => props.expired ?
    'var(--acx-subtitle-5-font-weight);':'var(--acx-subtitle-6-font-weight);' }
`
export const SubTips = styled.div.attrs((props: { expired: boolean }) => props)`
  display: flex;
  height: 16px;
  padding-top: 2px;
  align-items: center;
  color: ${props => props.expired ? 'var(--acx-primary-white);':'var(--acx-accents-orange-50);'}
  font-weight: ${props => props.expired ?
    'var(--acx-subtitle-6-font-weight);':'var(--acx-subtitle-5-font-weight);' }
  font-size: 12px;
`

export const ActiveBtn = styled(Button).attrs({ type: 'link' })<
ButtonProps & { expired?: boolean }
>`
  height: 20px;
  color: ${props => props.expired ?
    'var(--acx-primary-white);':'var(--acx-accents-orange-50);' }
  font-weight: var(--acx-subtitle-5-font-weight);
  font-size: 12px;
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
  width: 20px !important;
  height: 20px !important;
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
export const WarnIcon = styled(WarningCircle).attrs((props: { isCritical: boolean }) => props)`
  width: 20px !important;
  height: 20px !important;
  display: inline-block;
  path:nth-child(3) {
    stroke: ${props => props.isCritical ? 'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);'}
  }
  path:nth-child(4) {
    stroke: ${props => props.isCritical ? 'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);'}
    fill: ${props => props.isCritical ? 'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);'}
  }
`


export const LicenseGrid = styled.div.attrs((props: { expired: boolean,
  isWhiteBorder: boolean, }) => props)`
  display: flex;
  align-items: end;
  background-color: ${props => props.expired ?
    'var(--acx-accents-orange-55);':'var(--acx-neutrals-90);' }
  height: 42px;
  padding-bottom: 4px;
  width: 100%;
  border-top: ${props => props.isWhiteBorder ?
    '1px solid rgba(86,87,88,0.7);':'1px solid rgba(255,255,255,0.4);'}
`//border color: var(--acx-neutrals-70);

export const WarningBtnContainer = styled.div`
  display: flex;
  width: 100%;
  padding-right: 10px;
  justify-content: space-between;
`
// eslint-disable-next-line max-len
export const LicenseWarningBtn = styled.div.attrs((props: { isCritical: boolean, isExpanded:boolean }) => props)`
  cursor: pointer;
  display: flex;
  background-color: ${props => props.isCritical ?
    'var(--acx-accents-orange-55);' : 'var(--acx-neutrals-90);'}
  height: 40px;
  width:100%;
  align-items: center;
  border-radius: ${props => (props.isExpanded && props.isCritical) ? ';':'4px;'}
`
export const CaretDown = styled(CaretDownSolid)`
  path:nth-child(2) {
    fill: var(--acx-primary-white);
    stroke: var(--acx-primary-white);
  }
`
