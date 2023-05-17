import { Space }       from 'antd'
import styled, { css } from 'styled-components/macro'

import { InformationSolid as InformationSVG,
  CheckMarkCircleSolid as CheckMarkSVG
} from '@acx-ui/icons'
export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`
export const VersionName = styled.span`
  font-weight: 600;
`
export const FwContainer = styled.div`
  background-color: var(--acx-accents-orange-10);
  color: var(--acx-neutrals-70);
  font-size: 12px;
  line-height: 20px;
  margin-right: 30px;
  border-radius: 4px;
  width:417px;
  height:92px;
  width: fit-content;
  padding: 13px 55px 12px 16px;
`
export const BannerVersion = styled.div`
`
export const LatestVersion = styled.div`
  font-weight: 600;
  margin-bottom: 14px;
  line-height: 18px;
`
export const InformationIcon = styled(InformationSVG)`
  margin-left:5px;
  margin-bottom: -3px;
  path:nth-child(1){
    fill: var(--acx-accents-orange-50);
    stroke: var(--acx-accents-orange-50);
  }
  path:nth-child(2){
    stroke: var(--acx-accents-orange-50);
  }
`
export const CheckMarkIcon = styled(CheckMarkSVG)`
  margin-left:5px;
  margin-right:5px;
  margin-bottom: -6px;
  path:nth-child(2){
    stroke-width:3px;
  }
`
export const CurrentDetail = styled.div`
  display:flex;
`
const labelStyle = css`
  width:180px;
  line-height: 18px;
`
export const CurrentLabel = styled.div`
  ${labelStyle}
`
export const CurrentLabelBold = styled.div`
  font-weight: 600;
  ${labelStyle}
`
export const CurrentValue = styled.div`

`
export const TabSpan = styled.span`
  display: flex;
  align-items: center;
  svg {
    height: 18px;
    width: 18px;
    margin-left: 5px;
    path {
      stroke: var(--acx-primary-white);
      fill: var(--acx-accents-orange-50);
    }
  }
`
export const DialogContent = styled.div`
  margin-top:20px;
  margin-bottom:20px;
`
export const TypeContent = styled.div`
  margin-right:5px;
`
