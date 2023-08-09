import { Popover as AntPopover, Layout as AntLayout,
  Select as AntSelect } from 'antd'
import styled, { css, createGlobalStyle } from 'styled-components/macro'

import { Tabs as UITabs, Button as UIButton } from '@acx-ui/components'
import { EyeSlashSolid as UIEyeSlashSolid,
  MobilePhoneOutlined as UIMobilePhoneOutlined,
  DesktopOutlined as UIDesktopOutlined,
  TabletOutlined as UITabletOutlined,
  PictureSolid as UIPictureSolid,
  BrushSolid as UIBrushSolid,
  Plus as UIPlus,
  Minus as UIMinus,
  TextMinus as UITextMinus,
  TextPlus as UITextPlus,
  ConfigurationSolid as AntSettingOutlined,
  EnvelopClosedOutlined as AntMailOutlined,
  EditOutlined as AntEditOutlined,
  AccountCircleOutlined as AntUserOutlined,
  FacebookOutlined as Facebook,
  GoogleSolidPlus,
  LinkedinOutlined as LinkedIn,
  TwitterOutlined as Twitter,
  SMSOutlined,
  EyeOpenSolid
}   from '@acx-ui/icons'

export const popoverClassName = 'portal-demo-popover'
export const modalClassName = 'portal-modal-preview'

export const PopoverStyle = createGlobalStyle`
  .${popoverClassName} {
    z-index: 7;
    padding-top: 0px;
    .ant-popover-arrow { display: none; }
    .ant-popover-inner {
      .ant-popover-inner-content {
        padding: 10px 10px;
      }
    }
  }
`
export const ModalStyle = createGlobalStyle`
  .ant-modal.ant-modal-confirm.${modalClassName} {
    top: 0px;
    height:100%;
    .ant-modal-confirm-btns{
      margin-top: 0px;
    }
    .ant-modal-content{
      height:100%;
      .ant-modal-body{
        height:100%;
        .ant-modal-confirm-body-wrapper{
          height: 100%;
          .ant-modal-confirm-body{
            height:100%;
            .ant-modal-confirm-content{
              height:100%;
              margin-top: 0px;
              .ant-layout{
                margin-bottom: 0px;
              }
            }
          }
        }
      }
    }

  }
`

export const CommonLabel = styled.div`
  padding: 10px 10px;
`
export const CommonHints = styled.div`
  font-size:12px;
  color:var(--acx-neutrals-50);
`
export const ComponentLabel = styled.label`
  width: 160px;
  padding-right:5px;
  display: inline-block;
`
export const ImgDesk = styled.img`
  &:hover{
    cursor:pointer;
  }
  margin-left: 40px;
`

export const ImgTablet =styled.img`
  &:hover{
    cursor:pointer;
  }
`

export const ImgMobile = styled.img`
  &:hover{
    cursor:pointer;
  }
`
const buttonStyle= css`
  margin-left: 0px;
  border: 0;
  padding-top:5px;
  color: var(--acx-accents-blue-60);
  background-color: var(--acx-primary-white);
  cursor: pointer;
`
export const Button = styled(UIButton)`
  ${buttonStyle}
  padding-top:0px;
`
export const PopoverButton = styled(UIButton)`
  ${buttonStyle}
  padding-left:0px;
  background-color: var(--acx-primary-white);
`
export const LayoutContent = styled(AntLayout)<{ $isPreview: boolean | undefined }>`
  border: 1px solid var(--acx-neutrals-50);
  background-color: var(--acx-primary-black) !important;
  .ant-layout{
    background-color: var(--acx-primary-black);
  }
  background-position: center;
  background-repeat: no-repeat;
  align-items: center;
  ${props => props.$isPreview ? css`
  height:100%;`: css`height: 608px;`}
  margin-bottom:10px;
`
export const LayoutView = styled(AntLayout)<{ $type: string | null }>`
  ${props => props.$type === 'desk' ? css`
  width:100%;
  ` : props => props.$type === 'tablet' ? css`
  width:70%;
  max-width:1024px;
  ` : css`
  width:430px;
  max-width:600px;
  `}
  align-items:center;
  .ant-layout{
    background-color: var(--acx-primary-white);
  }
  background-position: center !important;
  background-repeat: no-repeat !important;
  height:100%;
  overflow-y:auto;
`
export const LayoutViewContent = styled(AntLayout)<{ isbg: string | null }>`
  ${props=>props.isbg === 'true'?css`opacity:0.93;`:css`opacity:1;`}
  padding-top:3px;
  width:425px;
  max-width:600px;
  align-items:center;
  background-color: var(--acx-primary-white) !important;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom:10px;
`
export const Label = styled.label`
  font-size:12px;
`
export const Select = styled(AntSelect)`
  &.ant-select-in-form-item { width: 200px; }
  padding-left: 10px;
`
export const LayoutHeader = styled.div`
  background-color: var(--acx-primary-white);
  height: 50px;
  padding: 10px 0 0 10px;
  border: 1px solid var(--acx-neutrals-50);
  border-bottom:0px;
`

export const FieldExtraTooltip = styled.div`
  padding-top:5px;
  padding-left:5px;
`
export const Img = styled.img`
  margin-bottom:10px;
  margin-top:5px;
`
export const ToolImg = styled.img`
  margin-right:5px;
  &:hover{
    cursor:pointer;
  }
`
export const Input=styled.input`
  border:0;
  width:280px;
  text-align:center;
  height:25px;
`
export const FieldText = styled.div`
  margin-top:10px;
  line-height: 26px;
  font-size:10px;
  text-align:center;
`
export const FieldTextMiddle = styled.div`
  margin-top:10px;
  line-height: 26px;
  font-size:12px;
  text-align:center;
`
export const FieldTextBig = styled.div`
  margin-top:10px;
  line-height: 26px;
  font-size:14px;
  text-align:center;
`
export const FieldLabel = styled.div`
  margin-top:10px;
  margin-bottom:5px;
  line-height: 24px;
`
const fieldInputStyle = css`
::placeholder{
  font-style:italic;
}
width:266px;
height:28px;
margin-top:10px;
padding-left:4px;
margin-bottom:10px;
border:1px solid var(--acx-neutrals-50);
&:focus{
  border:1px solid var(--acx-neutrals-50);
  outline:0;
}
`
export const FieldInput = styled.input`
  ${fieldInputStyle}
  border-radius:5px;
`
export const FieldInputSmall = styled.input`
  ${fieldInputStyle}
  width:232px;
  margin-top:0px;
  margin-bottom:0px;
  border:0;
  pointer-events:none;
`
export const PortalButton = styled.button`
  margin-top:20px;
  margin-bottom:10px;
  width:220px;
  height:32px;
  background-color:var(--acx-accents-orange-50);
  color:var(--acx-primary-white);
  border-radius:4px;
  border:0;
  cursor:pointer;
  font-size:12px;
  line-height:16px;
`
const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`
export const FieldLabelLink = styled.label`
  font-size: var(--acx-body-5-font-size) !important;
  ${linkStyle}
`
export const ViewSection = styled.div`
  margin-top:10px;
  height:auto;
  width:420px;
  max-width:100%;
  text-align:center;
  padding:25px 5px 25px 5px;
  border: 2px solid var(--acx-neutrals-30);
`
export const ViewSectionNoBorder = styled.div`
  margin-top:10px;
  height:auto;
  width:420px;
  max-width:100%;
  text-align:center;
  padding:10px 0 10px 0;
  border: 2px solid var(--acx-neutrals-30);

`
export const ViewSectionLink = styled.div`
  text-align: right;
  padding-right:65px;
  padding-top: 5px;
  font-size: 12px;
  color:var(--acx-accents-blue-50);
  cursor:pointer;
`
export const ViewSectionText = styled.div`
  padding-top: 5px;
  font-size: 10px;
  color:var(--acx-neutrals-60);
  text-align:left;
  margin-left:45px;
`
export const ViewSectionTitle = styled.div`
  font-size:18px;
  height:21px;
  font-weight:700;
  color:var(--acx-primary-black);
`
export const ViewSectionTabs = styled(UITabs)`
  padding-left:15px;
  margin-top:10px;
  margin-bottom:10px;
  width:400px;
  &.ant-tabs-card {
    .ant-tabs-nav::before {
      display: none;
    }
    .ant-tabs-nav {
      padding-left:0px;
      margin-left:auto;
      margin-right:auto;
      .ant-tabs-nav-list{
        border-bottom: 1px solid var(--acx-neutrals-30);
        .ant-tabs-tab {
          border:0;
          margin-left:2px !important;
          &.ant-tabs-tab-active {
            border: 0;
            color:var(--acx-neutrals-20);
            border-bottom: 2px solid var(--acx-accents-orange-50);
            .ant-tabs-tab-btn{
              color:var(--acx-primary-black);
            }
          }
      }
    }
  }
  .ant-tabs-content {
    margin-left:2px;
    height: auto;
    min-height:200px;
    width: 380px;
    border: 0;
  }
`
export const ViewSectionSocial=styled.div<{ $type: string | null }>`
  color: var(--acx-primary-white);
  ${props => props.$type === 'sms' ? css`
  background-color:var(--acx-neutrals-60);
  ` : props => props.$type === 'facebook' ? css`
  background-color:var(--acx-accents-blue-55);
  ` : props => props.$type === 'microsoft' ? css`
  background-color:var(--acx-neutrals-100);
  `: props => props.$type === 'twitter' ? css`
  background-color:var(--acx-accents-blue-50);
  `: props => props.$type === 'google' ? css`
  background-color:var(--acx-primary-white);
  color: var(--acx-primary-black);
  border:1px solid var(--acx-neutrals-30);
  `: css `
  background-color:var(--acx-accents-blue-60);
  `}
  margin:auto;
  display:flex;
  height:40px;
  width:240px;
  border-radius:5px;
  margin-bottom:10px;
  cursor:pointer;
`
export const ViewSectionSocialText=styled.div`
  padding-top:11px;
  padding-left:30px;
`
export const ViewSectionSocialIcon=styled.div`
  padding-left:10px;
 .anticon{
  font-size:28px;
  padding-top:10px;
  padding-left:20px;
 }
`
const iconsStyle = css`
margin-bottom:-7px;
width: 25px;
height: 25px;
background-color: var(--acx-primary-white);
border-radius: 5px 0 0 5px;
`
export const ViewSectionMobileOutlined = styled(UIMobilePhoneOutlined)`
${iconsStyle}
path{
  stroke:var(--acx-primary-black);
}
`
export const ViewSectionUserOutlined = styled(AntUserOutlined)`
${iconsStyle}
path:nth-child(1){
  stroke: var(--acx-primary-white);
}
`
export const ViewSectionMailOutlined = styled(AntMailOutlined)`
${iconsStyle}
path:nth-child(2){
  stroke:var(--acx-primary-black);
}
`
export const ViewSectionEditOutlined = styled(AntEditOutlined)`
${iconsStyle}
`
export const ViewSectionSpan = styled.span`
 color:var(--acx-accents-orange-30);
 margin-left:2px;
`
export const ViewTextArea = styled.textarea`
 width:100%;
 height: 327px;
 line-height:20px;
 overflow-y:auto;
 text-align: left;
 padding: 5px 5px 20px 20px;
 border: 0;
 resize: none;
 outline: none;
`
export const Popover = styled(AntPopover)`

`
export const SettingOutlined = styled(AntSettingOutlined)`
  color: var(--acx-accents-blue-50);
  width: 16px;
  height: 16px;
  &:hover{
    cursor: pointer;
  }
`
export const SelectedDiv = styled.div`
  width: 100%;
  padding-left: 200px;
  padding-right: 73px;
`
const iconsEditStyle = css`
  &:hover{
    background-color:var(--acx-neutrals-25);
  }
  margin-left:5px;
  margin-right:5px;
  width: 16px;
`
export const PlusOutlined = styled(UIPlus)<{ $showPlus: boolean | null }>`
  ${iconsEditStyle}
  ${props=>!props.$showPlus?css`path{stroke:var(--acx-neutrals-30);}`:
    css`path{stroke:var(--acx-primary-black);}`}
`
export const MinusOutlined = styled(UIMinus)<{ $showMinus: boolean | null }>`
  ${iconsEditStyle}
  ${props=>!props.$showMinus?css`path{stroke:var(--acx-neutrals-30);}`:
    css`path{stroke:var(--acx-primary-black);}`}
`
export const TextMinus = styled(UITextMinus)<{ $showMinus: boolean | null }>`
  ${iconsEditStyle}
  ${props=>!props.$showMinus?css`path{stroke:var(--acx-neutrals-30);}`:
    css`path{stroke:var(--acx-primary-black);}`}
`
export const TextPlus = styled(UITextPlus)<{ $showPlus: boolean | null }>`
  ${iconsEditStyle}
  ${props=>!props.$showPlus?css`path{stroke:var(--acx-neutrals-30);}`:
    css`path{stroke:var(--acx-primary-black);}`}
`
export const FontColorsOutlined = styled(UIBrushSolid)<{ $showColorPicker: boolean | undefined }>`
  ${iconsEditStyle}
  ${props=>props.$showColorPicker?css`path{
    stroke:var(--acx-accents-orange-50);
    fill:var(--acx-accents-orange-50);
  }`:
    css`path{
      stroke:var(--acx-primary-black);
      fill:var(--acx-primary-black);
    }`}
`
export const PictureFilled = styled(UIPictureSolid)`
  ${iconsEditStyle}
`
export const EyeSlashSolid = styled(UIEyeSlashSolid)`
  ${iconsEditStyle}
`
const deviceIcons = css`
  &:hover{
    background-color:var(--acx-accents-orange-10);
    border-radius:4px;
  }
  margin-left:5px;
  margin-right:5px;
  height:32px;
  width:32px;
  color:var(--acx-primary-black);
`
const deviceSelectedIcons = css`
  border:1px solid;
  border-radius:4px;
  color:var(--acx-accents-orange-50);
  background-color:var(--acx-accents-orange-20);
  path,circle,rect{
    stroke:var(--acx-accents-orange-50);
    fill:var(--acx-accents-orange-50);
  }
  rect{
    fill:var(--acx-primary-white);
  }
`
export const TabletOutlined = styled(UITabletOutlined)<{ $marked: boolean | null }>`
  ${deviceIcons}
  rect,path {
    fill:none;
  }
  path{
    fill:var(--acx-primary-black);
  }
  ${props => props.$marked ? deviceSelectedIcons:''}
`
export const DesktopOutlined = styled(UIDesktopOutlined)<{ $marked: boolean | null }>`
  ${deviceIcons}
  rect,path {
    fill:none;
  }
  path{
    fill:var(--acx-primary-black);
  }
  ${props => props.$marked ? deviceSelectedIcons:''}
  margin-left: 50px;
`
export const MobileOutlined = styled(UIMobilePhoneOutlined)<{ $marked: boolean | null }>`
  ${deviceIcons}
  ${props => props.$marked ? deviceSelectedIcons:''}
  ${props => props.$marked ? css`
    path{
      fill:var(--acx-primary-white);
    }
  `:''}
`
export const PictureOutlined = styled(UIPictureSolid)<{ $isDesk: boolean | null }>`
  position: absolute;
  left: 10px;
  top: 60px;
  font-size: 32px;
  ${props => !props.$isDesk ? css`
  path,rect,circle{stroke:var(--acx-primary-black);}
  path,circle{fill:var(--acx-primary-black);}
  ` : css`
  path,rect,circle{stroke:var(--acx-accents-blue-50);}
  path,circle{fill:var(--acx-accents-blue-50);}
  `}
`
const socialIconStyle=css`
  width: 21px;
  height: 21px;
  margin-top: 10px;
`
export const FacebookOutlined = styled(Facebook)`
  ${socialIconStyle}
`
export const TwitterOutlined = styled(Twitter)`
${socialIconStyle}
`
export const LinkedinOutlined = styled(LinkedIn)`
${socialIconStyle}
`
export const SMSMobileOutlined = styled(SMSOutlined)`
${socialIconStyle}
`
export const GoogleOutlined = styled(GoogleSolidPlus)`
${socialIconStyle}
`
export const ViewDivInput = styled.div`
border:1px solid var(--acx-neutrals-50);
border-radius:5px;
width:272px;
margin-left:45px;
margin-bottom:10px;
`
export const EyeOpenPreview = styled(EyeOpenSolid)`
cursor: pointer;
path{
  fill:var(--acx-accents-blue-50) !important;
  stroke:var(--acx-accents-blue-50) !important;
}
path:nth-child(1){
  fill: var(--acx-primary-white) !important;
}
`
