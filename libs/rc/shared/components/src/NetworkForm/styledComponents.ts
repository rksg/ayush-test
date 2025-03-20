import {
  Checkbox as UICheckbox
} from 'antd'
import styled, { css } from 'styled-components/macro'

import { Drawer as UIDrawer, Alert as UIAlert }   from '@acx-ui/components'
import {
  ConfigurationSolid as UIConfigurationSolid,
  SMSToken as UISMSToken, Google as UIGoogle,
  Facebook as UIFacebook, Twitter as UITwitter,
  LinkedIn as UILinkedIn, InformationSolid,
  EnvelopClosedSolid as UIEmailOTP,
  WarningTriangleSolid as UITriangle, Whatsapp
} from '@acx-ui/icons'
export const Diagram = styled.div`
  width: 358px;
  margin-top: 40px;
`

export const Title = styled.h1`
  padding-top: 11px;
  color: #7f7f7f;
  font-size: 20px;
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`
export const Drawer = styled(UIDrawer)`
  [class*="styledComponents__Wrapper"]{
    top:-20px;
  }
  [class*="styledComponents__ActionsContainer"]{
    width:calc( 100% - var(--acx-sider-width) + 20px);
    margin-left:-20px;
    padding-left:20px;
  }
  [class*="styledComponents__ActionsContainer"]::before{
    width:0px;
  }
`
export const Checkbox = styled(UICheckbox)`
  width: 130px;
`
export const RedAlertCheckbox = styled(UICheckbox)<{ alert?: boolean }>`
  ${(props) => {
    if(props.alert) {
      return `
        width: 130px;
        > span > span {
          background-color: white !important;
          border-color: var(--acx-semantics-red-70) !important;
        }
        .ant-checkbox-inner::after {
          border: 2px solid var(--acx-semantics-red-70);
          border-top: 0;
          border-left: 0;
        }
        > span:nth-of-type(2) {
          color: var(--acx-semantics-red-70);
        }
        > span:nth-of-type(2) > svg > path {
          fill: var(--acx-semantics-red-70);
        }
      `
    }
    return 'width: 130px;'
  }}
`

export const ConfigurationSolid = styled(UIConfigurationSolid)`
  &:hover{
    cursor: pointer;
    width: 18px !important;
    height: 18px !important;
  }
  margin-bottom: -3px;
  margin-left:-6px !important;
  color: var(--acx-primary-black);
`
const socialIconStyle=css`
  width: 16px;
  height: 16px;
  margin-bottom: -4px;
  margin-right: 3px;
  path{
    fill:var(--acx-neutrals-60);
  }
`

const emailOTPIconStyle=css`
  width: 16px;
  height: 16px;
  margin-bottom: -4px;
  margin-right: 3px;
  path:first-of-type {
    fill:var(--acx-neutrals-60);
  }
  path {
    stroke:var(--acx-neutrals-60);
  }
`

const whatsAppIconStyle=css`
  width: 16px;
  height: 16px;
  margin-bottom: -4px;
  margin-right: 3px;
  path:first-of-type {
    fill:var(--acx-neutrals-60);
  }
  path {
    stroke:var(--acx-neutrals-60);
  }
`

const whatsAppOutlineIconStyle=css`
  width: 16px;
  height: 16px;
  margin-bottom: -4px;
  margin-right: 3px;
  path:first-of-type {
    fill: white;
  }
  path {
    stroke: white;
  }
`

export const SMSToken = styled(UISMSToken)`
  ${socialIconStyle}
`

export const EMailOTP = styled(UIEmailOTP)`
  ${emailOTPIconStyle}
`
export const WhatsApp = styled(Whatsapp)`
  ${whatsAppIconStyle}
`

export const WhatsAppOutline = styled(Whatsapp)`
  ${whatsAppOutlineIconStyle}
`

export const WarningTriangleSolid = styled(UITriangle)`
  width: 16px;
  height: 16px;
  path {
    stroke: white !important;
  }
  path:nth-child(1) {
    stroke: var(--acx-semantics-red-70) !important;
    fill: var(--acx-semantics-red-70);
  }
  path:nth-child(3) {
    stroke: var(--acx-semantics-red-70) !important;
  }
`

export const Google = styled(UIGoogle)`
width: 16px;
height: 16px;
margin-bottom: -4px;
margin-right: 3px;
path{
  stroke:var(--acx-neutrals-60);
}
`
export const Facebook = styled(UIFacebook)`
${socialIconStyle}
`
export const Twitter = styled(UITwitter)`
${socialIconStyle}
`
export const LinkedIn = styled(UILinkedIn)`
${socialIconStyle}
`
export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`

export const AsteriskFormTitle = styled.span`
  color: '#808284';
  fontSize: '12px';
  &::after {
      content: "*";
      margin-right: 0;
      margin-left: 3px;
      color: var(--acx-accents-orange-50);
      font-family: var(--acx-neutral-brand-font);
      font-size: var(--acx-body-4-font-size);
      line-height: var(--acx-body-4-line-height);
      display: inline-block;
      box-sizing: border-box;
  }
`
export const InfoIcon = styled(InformationSolid)`
  &:hover{
    width: 20px !important;
    height: 20px !important;
  }
  width: 20px !important;
  height: 20px !important;
  margin-bottom: -6px;
  margin-left: 6px !important;
  path {
    fill: var(--acx-accents-orange-50);
    stroke: var(--acx-primary-white) !important;
  }
`
export const AlertNote = styled(UIAlert)`
  .ant-alert-close-icon {
    float: right;
    position: absolute;
    right: 15px;
    bottom: 10px;
   }
  .ant-alert-close-text {
    color: var(--acx-accents-blue-50);
  }
  &.ant-alert-info {
    background-color: var(--acx-accents-orange-20) !important;
    border: none !important;
  }
`

export const TitleBold = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`
