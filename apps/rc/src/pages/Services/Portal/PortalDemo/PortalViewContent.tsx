
import { useState } from 'react'

import { Demo, PortalViewEnum } from '@acx-ui/rc/utils'

import Wifi4eu                   from '../../../../assets/images/portal-demo/WiFi4euBanner.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'
import * as UI                   from '../styledComponents'

import PortalPhotoContent         from './PortalContent/PortalPhotoContent'
import PortalPoweredByContent     from './PortalContent/PortalPoweredByContent'
import PortalSecondaryTextContent from './PortalContent/PortalSecondaryTextContent'
import PortalWelcomeContent       from './PortalContent/PortalWelcomeContent'
import PortalImageTools           from './PortalImageTools'
import PortalPopover              from './PortalPopover'
import PortalViewConfirm          from './PortalViewConfirm'
import PortalViewGoThrough        from './PortalViewGoThrough'
import PortalViewGuestConnect     from './PortalViewGuestConnect'
import PortalViewGuestForget      from './PortalViewGuestForget'
import PortalViewHostApproval     from './PortalViewHostApproval'
import PortalViewSelfSignConnect  from './PortalViewSelfSignConnect'
import PortalViewSelfSignRegister from './PortalViewSelfSignRegister'
import PortalViewTerms            from './PortalViewTerms'
export default function PortalViewContent (props:{
  view: PortalViewEnum,
  demoValue: Demo,
  updateViewContent:(value:Demo)=>void,
  portalLang: { [key:string]:string }
}) {
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const { view, demoValue, updateViewContent, portalLang } = props
  const [cursor, setCursor]=useState('none')
  const [outline, setOutline]=useState('none')
  const componentDisplay = demoValue.componentDisplay
  const isbg = demoValue?.bgImage ? 'true' : 'false'
  const [clicked, setClicked]=useState(false)
  const logoTools = <PortalImageTools
    url={demoValue.logo as string}
    size={demoValue.logoRatio as number}
    defaultSize={PortalDemoDefaultSize.logoRatio}
    showText={false}
    showColorPic={false}
    updateDemoImg={(data)=>{
      updateViewContent({ ...demoValue, logo: data.url, logoRatio: data.size,
        componentDisplay: { ...demoValue.componentDisplay, logo: data.show as boolean } })
    }}
  />
  const isLogoPhotoHide = !componentDisplay.logo && !componentDisplay.photo&&
    !componentDisplay.wifi4eu
  return (
    <UI.LayoutViewContent isbg={isbg} style={isLogoPhotoHide?{ paddingTop: 150 }:{}}>
      {componentDisplay.wifi4eu && <UI.Img src={Wifi4eu}
        alt={'Wifi4eu'}
        height={120} />}
      {componentDisplay.logo &&<PortalPopover
        content={logoTools}
        visible={clicked}
        onVisibleChange={(value)=>setClicked(value)}
      >
        <UI.Img src={demoValue.logo}
          alt={'Logo'}
          style={{ height: (demoValue.logoRatio||PortalDemoDefaultSize.logoRatio),
            cursor: cursor, outline: outline,maxWidth: 425, marginTop: 50, marginBottom: 20 }}
          onMouseOver={()=>{setCursor('pointer')
            setOutline(dashedOutline)}}
          onMouseLeave={()=>{
            if(!clicked){setCursor('none')
              setOutline('none')}}}
          onClick={()=>{setCursor('pointer')
            setClicked(true)
            setOutline(dashedOutline)}}
        /></PortalPopover>}
      {componentDisplay.welcome && <PortalWelcomeContent
        demoValue={demoValue}
        updateWelcome={(data)=>{
          updateViewContent({ ...demoValue, welcomeSize: data.size||demoValue.welcomeSize,
            componentDisplay: { ...demoValue.componentDisplay, welcome: data.show as boolean },
            welcomeText: data.text||'',
            welcomeColor: data.color||demoValue.welcomeColor })}}
      />}
      {componentDisplay.photo &&
        <PortalPhotoContent
          demoValue={demoValue}
          updatePhoto={(data)=>{
            updateViewContent({ ...demoValue, photo: data.url, photoRatio: data.size,
              componentDisplay: { ...demoValue.componentDisplay, photo: data.show as boolean } })}}
        />}
      {componentDisplay.secondaryText &&
        <PortalSecondaryTextContent
          demoValue={demoValue}
          updateSecText={(data)=>{
            updateViewContent({ ...demoValue, secondarySize: data.size||demoValue.secondarySize,
              componentDisplay: { ...demoValue.componentDisplay,
                secondaryText: data.show as boolean }, secondaryColor: data.color||
                demoValue.secondaryColor, secondaryText: data.text||'' })}}
        />}
      {view === PortalViewEnum.ClickThrough && <PortalViewGoThrough
        portalLang={portalLang}
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.GuestPassConnect && <PortalViewGuestConnect
        portalLang={portalLang}
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.GuestPassForgot && <PortalViewGuestForget
        portalLang={portalLang}
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.SelfSignIn &&
      <PortalViewSelfSignConnect portalLang={portalLang}/>}
      {view === PortalViewEnum.SelfSignInRegister &&
      <PortalViewSelfSignRegister
        portalLang={portalLang}
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.HostApproval &&
      <PortalViewHostApproval
        portalLang={portalLang}
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.ConnectionConfirmed &&
      <PortalViewConfirm portalLang={portalLang}/>}
      {view === PortalViewEnum.TermCondition &&
      <PortalViewTerms demoValue={demoValue}
        portalLang={portalLang}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}/>}
      {componentDisplay.termsConditions &&<UI.FieldText>{
        props.portalLang.acceptTermsMsg2?.replace('{0}','')}&nbsp;&nbsp;
      <UI.FieldTextLink>
        {props.portalLang.acceptTermsLink}
      </UI.FieldTextLink></UI.FieldText>}
      {componentDisplay.poweredBy &&<PortalPoweredByContent
        portalLang={portalLang}
        demoValue={demoValue}
        updatePoweredBy={(data)=>{
          updateViewContent({ ...demoValue, poweredImg: data.url||demoValue.poweredImg,
            componentDisplay: { ...demoValue.componentDisplay, poweredBy: data.show as boolean },
            poweredImgRatio: data.size||demoValue.poweredImgRatio,
            poweredBgColor: data.bgcolor||demoValue.poweredBgColor,
            poweredColor: data.color||demoValue.poweredColor,
            poweredSize: data.textsize||demoValue.poweredSize })}}
      />}
    </UI.LayoutViewContent>
  )
}

