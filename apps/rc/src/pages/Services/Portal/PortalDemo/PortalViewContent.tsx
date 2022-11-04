
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Demo, PortalViewEnum } from '@acx-ui/rc/utils'

import Wifi4eu                   from '../../../../assets/images/portal-demo/wifi4eu-banner.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'
import * as UI                   from '../styledComponents'

import PortalAlternativeLanguage  from './PortalAlternativeLanguage'
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
  updateViewContent:(value:Demo)=>void
}) {
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const { view, demoValue, updateViewContent } = props
  const { $t } = useIntl()
  const [cursor, setCursor]=useState('none')
  const [outline, setOutline]=useState('none')
  const alternativeLang = demoValue.alternativeLang
  const componentDisplay = demoValue.componentDisplay
  const isbg = demoValue?.backgroundImage ? 'true' : 'false'
  const [clicked, setClicked]=useState(false)
  const logoTools = <PortalImageTools
    url={demoValue.logo as string}
    size={demoValue.logoSize as number}
    defaultSize={PortalDemoDefaultSize.logoSize}
    showText={false}
    showColorPic={false}
    updateDemoImg={(data)=>{
      updateViewContent({ ...demoValue, logo: data.url, logoSize: data.size,
        componentDisplay: { ...demoValue.componentDisplay, Logo: data.show as boolean } })
    }}
  />
  return (
    <UI.LayoutViewContent isbg={isbg}>
      {componentDisplay.WiFi4EU && <UI.Img src={Wifi4eu}
        alt={$t({ defaultMessage: 'Wifi4eu' })}
        height={120} />}
      <PortalAlternativeLanguage alternativeLang={alternativeLang}/>
      {componentDisplay.Logo &&<PortalPopover
        content={logoTools}
        visible={clicked}
        onVisibleChange={(value)=>setClicked(value)}
      >
        <UI.Img src={demoValue.logo}
          alt={$t({ defaultMessage: 'Logo' })}
          style={{ height: (demoValue.logoSize||PortalDemoDefaultSize.logoSize),
            cursor: cursor, outline: outline,maxWidth: 425 }}
          onMouseOver={()=>{setCursor('pointer')
            setOutline(dashedOutline)}}
          onMouseLeave={()=>{
            if(!clicked){setCursor('none')
              setOutline('none')}}}
          onClick={()=>{setCursor('pointer')
            setClicked(true)
            setOutline(dashedOutline)}}
        /></PortalPopover>}
      {componentDisplay.WelcomeText && <PortalWelcomeContent
        demoValue={demoValue}
        updateWelcome={(data)=>{
          updateViewContent({ ...demoValue, welcomeSize: data.size||demoValue.welcomeSize,
            componentDisplay: { ...demoValue.componentDisplay, WelcomeText: data.show as boolean },
            welcomeText: data.text||demoValue.welcomeText,
            welcomeColor: data.color||demoValue.welcomeColor })}}
      />}
      {componentDisplay.Photo &&
        <PortalPhotoContent
          demoValue={demoValue}
          updatePhoto={(data)=>{
            updateViewContent({ ...demoValue, photo: data.url, photoSize: data.size,
              componentDisplay: { ...demoValue.componentDisplay, Photo: data.show as boolean } })}}
        />}
      {componentDisplay.SecondaryText &&
        <PortalSecondaryTextContent
          demoValue={demoValue}
          updateSecText={(data)=>{
            updateViewContent({ ...demoValue, secondarySize: data.size, componentDisplay:
              { ...demoValue.componentDisplay, SecondaryText: data.show as boolean },
            secondaryColor: data.color })}}
        />}
      {view === PortalViewEnum.ClickThrough && <PortalViewGoThrough
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.GuestPassConnect && <PortalViewGuestConnect
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.GuestPassForgot && <PortalViewGuestForget
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.SelfSignIn &&
      <PortalViewSelfSignConnect/>}
      {view === PortalViewEnum.SelfSignInRegister &&
      <PortalViewSelfSignRegister
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.HostApproval &&
      <PortalViewHostApproval
        demoValue={demoValue}
        updateBtn={(data)=>{
          updateViewContent({ ...demoValue, buttonColor: data.color })}}
      />}
      {view === PortalViewEnum.ConnectionConfirmed &&
      <PortalViewConfirm/>}
      {view === PortalViewEnum.TermCondition &&
      <PortalViewTerms demoValue={demoValue}/>}
      {componentDisplay.TermsConditions &&<UI.FieldText>{$t({
        defaultMessage: 'By clicking the connect button, you are accepting the'
      })}&nbsp;&nbsp;
      <UI.FieldTextLink>
        {$t({ defaultMessage: 'terms & conditions' })}
      </UI.FieldTextLink></UI.FieldText>}
      {componentDisplay.PoweredBy &&<PortalPoweredByContent
        demoValue={demoValue}
        updatePoweredBy={(data)=>{
          updateViewContent({ ...demoValue, poweredImg: data.url||demoValue.poweredImg,
            componentDisplay: { ...demoValue.componentDisplay, PoweredBy: data.show as boolean },
            poweredImgSize: data.size||demoValue.poweredImgSize,
            poweredBackgroundColor: data.bgcolor||demoValue.poweredBackgroundColor,
            poweredColor: data.color||demoValue.poweredColor,
            poweredSize: data.textsize||demoValue.poweredSize })}}
      />}
    </UI.LayoutViewContent>
  )
}

