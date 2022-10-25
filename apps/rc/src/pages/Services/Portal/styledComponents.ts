import {
  MobileOutlined as AntMobileOutlined,
  UserOutlined as AntUserOutlined,
  MailOutlined as AntMailOutlined,
  EditOutlined as AntEditOutlined,
  SettingFilled as AntSettingOutlined,
  PlusOutlined as AntPlusOutlined,
  MinusOutlined as AntMinusOutlined,
  EyeInvisibleOutlined as AntEyeInvisibleOutlined
} from '@ant-design/icons'
import { Tabs as AntTabs, Popover as AntPopover,
  Select as AntSelect, Layout as AntLayout, Switch as AntSwitch, Modal as AntModal } from 'antd'
import styled, { css  } from 'styled-components/macro'
export const CommonLabel = styled.div`
  padding: 10px 0 5px 10px;
`
export const Switch = styled(AntSwitch)`
  &.ant-switch {
    background-color: var(--acx-neutrals-60);
    .ant-switch-handle::before { background-color: var(--acx-primary-white); }

  }

  &.ant-switch-checked {
    background-color: var(--acx-accents-blue-50);
    }
  }
`
export const ComponentLabel = styled.label`
  width: 180px;
  padding-right:5px;
  display: inline-block;
`
export const CommonContainer= styled.div<{ $isShow: boolean | null }>`
  ${props => props.$isShow ? css`
  display:'';
  `:css`
  display: none;
  `}
  float: right;
  border: 1px solid var(--acx-neutrals-50);
  background-color: var(--acx-primary-white);
  width: 300px;
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
  margin-left: 10px;
  border: 0;
  padding-top:5px;
  color: var(--acx-accents-blue-60);
  background-color: var(--acx-neutrals-20);
  cursor: pointer;
`
export const Button = styled.button`
  ${buttonStyle}
`
export const PopoverButton = styled.button`
  ${buttonStyle}
  background-color: var(--acx-primary-white);
`
export const LayoutContent = styled(AntLayout)`
  border: 1px solid var(--acx-neutrals-50);
  width: 95%;
  min-height: 700px;
  background-color: var(--acx-primary-black);
  background-position: center;
  background-repeat: no-repeat;
  align-items: center;
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
  min-height: 700px;
  background-color: var(--acx-primary-white);
  background-position: center;
  background-repeat: no-repeat;
`
export const LayoutViewContent = styled(AntLayout)<{ isBg: boolean | null }>`
  ${props=>props.isBg?css`opacity:0.8;`:css`opacity:1;`}
  padding-top:3px;
  width:425px;
  max-width:600px;
  min-height: 700px;
  align-items:center;
  background-color: var(--acx-primary-white);
  background-position: center;
  background-repeat: no-repeat;
`
export const Label = styled.label`

`
export const Select = styled(AntSelect)`
  &.ant-select-in-form-item { width: 200px; }
  padding-left: 10px;
`
export const LayoutHeader = styled.div`
  background-color: var(--acx-neutrals-20);
  width: 95%;
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
  &:focus,&:hover{
    outline:1px dashed var(--acx-neutrals-50);
  }
`
export const FieldText = styled.div`
  margin-top:10px;
  line-height: 24px;
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
width:280px;
height:25px;
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
`
export const FieldInputSmall = styled.input`
  ${fieldInputStyle}
  width:250px;
  margin-bottom:0px;
`
export const PortalButton = styled.button`
  margin-top:20px;
  margin-bottom:10px;
  width:280px;
  height:50px;
  background-color:var(--acx-accents-orange-50);
  color:var(--acx-primary-white);
  border-radius:5px;
  border:0;
  cursor:pointer;
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
  ${linkStyle}
`
export const Modal = styled(AntModal)`
&.ant-modal{
  &:not(.ant-modal-confirm) {
    .ant-modal-content {
      border-radius: 0px;
    border:0;
    .ant-modal-body {
      overflow-y:auto;
    }
  }
  .ant-modal-footer {
    background:var(--acx-primary-white);
  }
}
`
export const ViewSection = styled.div`
  height:auto;
  width:420px;
  max-width:100%;
  text-align:center;
  padding:10px 0 10px 0;
  border: 2px solid var(--acx-neutrals-40);
`
export const ViewSectionLink = styled.div`
  text-align: right;
  padding-right:65px;
  padding-top: 5px;
  font-size: 11px;
  color:var(--acx-accents-blue-50);
  cursor:pointer;
`
export const ViewSectionText = styled.div`
  padding-top: 5px;
  font-size: 11px;
  color:var(--acx-neutrals-60);
`
export const ViewSectionTitle = styled.div`
  font-size:18px;
  height:21px;
  font-weight:700;
  color:var(--acx-primary-black);
`
export const ViewSectionTabs = styled(AntTabs)`
  margin-top:11px;
  margin-bottom:10px;
  width:400px;
  padding-left:10px;
  &.ant-tabs-card {
    .ant-tabs-nav::before {
      display: none;

    }
    .ant-tabs-nav {
      .ant-tabs-nav-list{
        .ant-tabs-tab {
          background: var(--acx-neutrals-20);
          margin-bottom:1px;
          &.ant-tabs-tab-active {
            background: var(--acx-neutrals-20);
            border:2px solid var(--acx-accents-orange-50);
            border-bottom:8px solid var(--acx-primary-white);
            margin-bottom: -3px;
          }
      }
    }
  }
  .ant-tabs-content {
    margin-top: -17px;
    margin-left: 15px;
    height: auto;
    min-height:200px;
    border: 2px solid var(--acx-accents-orange-50);
    width: 380px;
  }
`
export const ViewSectionTabsBig = styled(AntTabs)`

  margin-top:10px;
  margin-bottom:10px;
  width:100%;
  &.ant-tabs-card {
    .ant-tabs-nav::before {
      display: none;
    }
    .ant-tabs-nav {
      padding-left:0 !important;
      .ant-tabs-nav-list{
        .ant-tabs-tab {
          &.ant-tabs-tab-active {
            border-color:var(--acx-neutrals-20);
            border:2px solid var(--acx-neutrals-20);
            border-bottom:3px solid var(--acx-primary-white);
            color:var(--acx-neutrals-20);
          }
      }
    }
  }
  .ant-tabs-content {
    height: auto;
    min-height:200px;
    margin-top:-18px;
    border-top: 2px solid var(--acx-neutrals-20);
  }
`
export const ViewSectionSocial=styled.div<{ $type: string | null }>`
  ${props => props.$type === 'sms' ? css`
  background-color:var(--acx-neutrals-70);
  ` : props => props.$type === 'facebook' ? css`
  background-color:var(--acx-accents-blue-70);
  ` : props => props.$type === 'microsoft' ? css`
  background-color:var(--acx-neutrals-100);
  `: props => props.$type === 'twitter' ? css`
  background-color:var(--acx-accents-blue-50);
  `: props => props.$type === 'google' ? css`
  background-color:var(--acx-semantics-red-50);
  `: css `
  background-color:var(--acx-accents-blue-80);
  `}
  margin:auto;
  display:flex;
  color: var(--acx-primary-white);
  height:50px;
  width:280px;
  border-radius:5px;
  margin-bottom:10px;
  cursor:pointer;
`
export const ViewSectionSocialText=styled.div`
  padding-top:15px;
  padding-left:30px;
`
export const ViewSectionSocialIcon=styled.div`
 .anticon{
  font-size:28px;
  padding-top:10px;
  padding-left:20px;
 }
`
const iconsStyle = css`
height: 26px;
background-color: var(--acx-neutrals-20);
padding-right: 5px;
padding-top: 6px;
padding-left: 5px;
border-radius: 5px 0 0 5px;
`
export const ViewSectionMobileOutlined = styled(AntMobileOutlined)`
${iconsStyle}
`
export const ViewSectionUserOutlined = styled(AntUserOutlined)`
${iconsStyle}
`
export const ViewSectionMailOutlined = styled(AntMailOutlined)`
${iconsStyle}
`
export const ViewSectionEditOutlined = styled(AntEditOutlined)`
${iconsStyle}
`
export const ViewSectionSpan = styled.span`
 color:var(--acx-accents-orange-30);
 margin-left:-9px;
`
export const ViewTextArea = styled.div`
 width:100%;
 border:0;
 height: 327px;
 line-height:20px;
 border-top: 2px solid var(--acx-neutrals-20);
 overflow-y:auto;
 text-align: left;
 padding: 5px 5px 0 20px;
`
export const Popover = styled(AntPopover)`



`
export const SettingOutlined = styled(AntSettingOutlined)`
  color: var(--acx-accents-blue-50);
  &.anticon-setting {
    font-size: 16px;
    padding-top:2px;
  }
`
export const SelectedDiv = styled.div`
  width: 100%;
  padding-left: 200px;
  padding-right: 73px;
`
export const PlusOutlined = styled(AntPlusOutlined)`
  margin-right:5px;
`
export const MinusOutlined = styled(AntMinusOutlined)`
  margin-right:5px;
`
export const EyeInvisibleOutlined = styled(AntEyeInvisibleOutlined)`
`
