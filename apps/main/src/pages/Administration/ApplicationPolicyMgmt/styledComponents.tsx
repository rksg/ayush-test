import { Collapse as AntCollapse } from 'antd'
import styled, { css }             from 'styled-components/macro'

import {
  CheckMarkCircleSolid as CheckMarkSVG
} from '@acx-ui/icons'

export const FwContainer = styled.div`
  background-color: var(--acx-accents-orange-10);
  color: var(--acx-neutrals-70);
  font-size: 12px;
  line-height: 20px;
  margin-right: 30px;
  border-radius: 4px;
  width:417px;
  height:80px;
  width: fit-content;
  padding: 13px 55px 12px 16px;
`
export const LatestVersion = styled.div`
  font-weight: 600;
  margin-bottom: 14px;
  line-height: 18px;
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
  width: 190px;
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
export const DialogFooter = styled.div`
  margin-top: 24px;
  display: grid;
`

export const DialogFooterButtons = styled.div`
  grid-area: 1 / 1 / 1 / 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`
export const Collapse = styled(AntCollapse)`
  grid-area: 1 / 1 / 1 / 1;
  .ant-collapse-item {
    flex: 1;
    > .ant-collapse-content >.ant-collapse-content-box {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-top: 16px;
    }
    > .ant-collapse-header {
      display: inline-flex;
      font-size: 12px !important;
      font-weight: var(--acx-body-font-weight) !important;
      line-height: 16px;
      color: var(--acx-accents-blue-50);
      padding: 7px 0 !important;
      flex-direction: row-reverse;
      justify-content: flex-end;
      border: 0 !important;
      .ant-collapse-arrow {
        position: unset;
        transform: none;
        margin-left: 5px;
      }
    }
  }
`
export const ImpactedRuleDetailsContainer = styled.div`
  border: 1px solid var(--acx-neutrals-30);
  border-radius: 4px;
  background: var(--acx-neutrals-10);
  padding: 12px 8px;
  color: var(--acx-primary-black);

`
export const ImpactedRuleDetailsItem = styled.div`
  margin: 2px 0;
  display: grid;
  align-items: center;
  grid-template-columns: 195px 100px;
`
