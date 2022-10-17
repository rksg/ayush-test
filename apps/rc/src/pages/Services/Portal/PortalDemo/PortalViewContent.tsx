
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { PortalViewEnum } from '@acx-ui/rc/utils'


import Photo   from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logopng from '../../../../assets/images/portal-demo/small-logo-img.png'
import Logosvg from '../../../../assets/images/portal-demo/small-logo-img.svg'
import * as UI from '../styledComponents'

import PortalAlternativeLanguage  from './PortalAlternativeLanguage'
import PortalTermsModal           from './PortalTermsModal'
import PortalViewConfirm          from './PortalViewConfirm'
import PortalViewGoThrough        from './PortalViewGoThrough'
import PortalViewGuestConnect     from './PortalViewGuestConnect'
import PortalViewGuestForget      from './PortalViewGuestForget'
import PortalViewHostApproval     from './PortalViewHostApproval'
import PortalViewSelfSignConnect  from './PortalViewSelfSignConnect'
import PortalViewSelfSignRegister from './PortalViewSelfSignRegister'
import PortalViewTerms            from './PortalViewTerms'
import PortalWifi4euModal         from './PortalWifi4euModal'
export default function PortalViewContent (props:{
  view: PortalViewEnum,
  alternativeLang:{ [key:string]: boolean },
  componentDisplay:{ [key:string]: boolean }
}) {
  const { $t } = useIntl()
  const [logo, setLogo]=useState(Logopng)
  const [welcomeText, setWelcomeText]=useState('Welcome to the Guest Access login page')
  const [secondaryText]=useState('Lorem ipsum dolor sit amet, '+
    'consectetur adipiscing elit. Aenean euismod bibendum laoreet.')
  const [cursor, setCursor]=useState('none')
  const { view, alternativeLang, componentDisplay } = props
  return (
    <UI.LayoutViewContent>
      {componentDisplay.WiFi4EU && <PortalWifi4euModal/>}
      <PortalAlternativeLanguage alternativeLang={alternativeLang}/>
      {componentDisplay.Logo && <UI.Img src={logo}
        alt={$t({ defaultMessage: 'Logo' })}
        height={105}
        style={{ cursor: cursor }}
        onMouseOver={()=>{setLogo(Logosvg); setCursor('pointer')}}
        onMouseLeave={()=>{setLogo(Logopng); setCursor('none')}}
        onMouseDown={()=>{setLogo(Logosvg); setCursor('pointer')}}
      />}
      {componentDisplay.WelcomeText && <UI.Input type='text'
        defaultValue={welcomeText}
        onChange={(e)=>setWelcomeText(e.target.value)}
      />}
      {componentDisplay.Photo &&
      <UI.Img src={Photo} alt={$t({ defaultMessage: 'Photo png' })}/>}
      {componentDisplay.SecondaryText &&
      <UI.FieldText>{secondaryText}</UI.FieldText>}
      {view === PortalViewEnum.ClickThrough && <PortalViewGoThrough/>}
      {view === PortalViewEnum.GuestPassConnect && <PortalViewGuestConnect/>}
      {view === PortalViewEnum.GuestPassForgot && <PortalViewGuestForget/>}
      {view === PortalViewEnum.SelfSignIn &&
      <PortalViewSelfSignConnect/>}
      {view === PortalViewEnum.SelfSignInRegister &&
      <PortalViewSelfSignRegister/>}
      {view === PortalViewEnum.HostApproval &&
      <PortalViewHostApproval/>}
      {view === PortalViewEnum.ConnectionConfirmed &&
      <PortalViewConfirm/>}
      {view === PortalViewEnum.TermCondition &&
      <PortalViewTerms/>}
      {componentDisplay.TermsConditions &&<PortalTermsModal/>}
      {componentDisplay.PoweredBy &&<UI.FieldText>
        {$t({ defaultMessage: 'Powered By' })}</UI.FieldText>}
      {componentDisplay.PoweredBy &&<UI.Img src={Powered}
        alt={$t({ defaultMessage: 'Powered by' })}
        style={{ height: 50, marginLeft: 180 }}
      ></UI.Img>}
    </UI.LayoutViewContent>
  )
}

