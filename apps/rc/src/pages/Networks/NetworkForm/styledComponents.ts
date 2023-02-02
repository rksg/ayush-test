import {
  Checkbox as UICheckbox
} from 'antd'
import styled, { css } from 'styled-components/macro'

import { Drawer as UIDrawer } from '@acx-ui/components'
import {
  ConfigurationSolid as UIConfigurationSolid,
  SMSToken as UISMSToken, Google as UIGoogle,
  Facebook as UIFacebook, Twitter as UITwitter,
  LinkedIn as UILinkedIn
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
  width:16px;
  margin-bottom:-11px;
  margin-right:3px;
  path{
    fill:var(--acx-neutrals-60);
  }
`
export const SMSToken = styled(UISMSToken)`
  ${socialIconStyle}
`
export const Google = styled(UIGoogle)`
width:16px;
margin-bottom:-11px;
margin-right:3px;
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
