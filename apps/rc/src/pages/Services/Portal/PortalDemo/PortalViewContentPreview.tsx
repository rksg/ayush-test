
import { useIntl } from 'react-intl'

import { Demo, PortalViewEnum } from '@acx-ui/rc/utils'

import Wifi4eu                   from '../../../../assets/images/portal-demo/wifi4eu-banner.png'
import { PortalDemoDefaultSize } from '../../commonUtils'
import * as UI                   from '../styledComponents'

import PortalAlternativeLanguage  from './PortalAlternativeLanguage'
import PortalViewConfirm          from './PortalViewConfirm'
import PortalViewGoThrough        from './PortalViewGoThrough'
import PortalViewGuestConnect     from './PortalViewGuestConnect'
import PortalViewGuestForget      from './PortalViewGuestForget'
import PortalViewHostApproval     from './PortalViewHostApproval'
import PortalViewSelfSignConnect  from './PortalViewSelfSignConnect'
import PortalViewSelfSignRegister from './PortalViewSelfSignRegister'
import PortalViewTerms            from './PortalViewTerms'
export default function PortalViewContentPreview (props:{
  view: PortalViewEnum,
  demoValue: Demo,
  isPreview?:boolean
}) {
  const { view, demoValue } = props
  const { $t } = useIntl()
  const alternativeLang = demoValue?.alternativeLang
  const componentDisplay = demoValue?.componentDisplay
  const isBg = demoValue?.backgroundImage ? true : false
  return (
    <UI.LayoutViewContent isBg={isBg}>
      {componentDisplay?.WiFi4EU && <UI.Img src={Wifi4eu}
        alt={$t({ defaultMessage: 'Wifi4eu' })}
        height={120} />}
      <PortalAlternativeLanguage alternativeLang={alternativeLang}/>
      {componentDisplay?.Logo &&<UI.Img src={demoValue.logo}
        alt={$t({ defaultMessage: 'Logo' })}
        style={{ height: (demoValue.logoSize||PortalDemoDefaultSize.logoSize) ,maxWidth: 425 }}
      />}
      {componentDisplay?.WelcomeText && <UI.Input type='text'
        defaultValue={demoValue.welcomeText}
        style={{ height: 25 * ((demoValue.welcomeSize||PortalDemoDefaultSize.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize) ,
        width: 280*((demoValue.welcomeSize||PortalDemoDefaultSize.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize||PortalDemoDefaultSize.welcomeSize) }}
      />}
      {componentDisplay?.Photo &&<UI.Img src={demoValue.photo}
        alt={$t({ defaultMessage: 'Photo png' })}
        style={{ height: (demoValue.photoSize||PortalDemoDefaultSize.photoSize) ,
          maxWidth: 425 }}
      />}
      {componentDisplay?.SecondaryText &&<UI.FieldText
        style={{ lineHeight: 24 * ((demoValue.secondarySize||
          PortalDemoDefaultSize.secondarySize)/PortalDemoDefaultSize.secondarySize)+'px' ,
        maxWidth: 425, color: demoValue.secondaryColor,
        fontSize: (demoValue.secondarySize||PortalDemoDefaultSize.secondarySize) }}
      >{demoValue.secondaryText}</UI.FieldText>}
      {view === PortalViewEnum.ClickThrough && <PortalViewGoThrough
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.GuestPassConnect && <PortalViewGuestConnect
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.GuestPassForgot && <PortalViewGuestForget
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.SelfSignIn &&
      <PortalViewSelfSignConnect/>}
      {view === PortalViewEnum.SelfSignInRegister &&
      <PortalViewSelfSignRegister
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.HostApproval &&
      <PortalViewHostApproval
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.ConnectionConfirmed &&
      <PortalViewConfirm/>}
      {view === PortalViewEnum.TermCondition &&
      <PortalViewTerms/>}
      {componentDisplay?.TermsConditions &&<UI.FieldText>{$t({
        defaultMessage: 'By clicking the connect button, you are accepting the'
      })}&nbsp;&nbsp;
      <UI.FieldTextLink>
        {$t({ defaultMessage: 'terms & conditions' })}
      </UI.FieldTextLink></UI.FieldText>}
      {componentDisplay.PoweredBy && <UI.SelectedDiv style={{ paddingLeft: 200/((
        demoValue.poweredImgSize ||
      PortalDemoDefaultSize.poweredImgSize)/PortalDemoDefaultSize.poweredImgSize) }}>
        <div style={{ backgroundColor: demoValue.poweredBackgroundColor }}>
          {demoValue.componentDisplay?.PoweredBy &&<UI.FieldText style={{
            fontSize: (demoValue.poweredSize||PortalDemoDefaultSize.poweredSize),
            lineHeight: 24 * ((demoValue.poweredSize||PortalDemoDefaultSize.poweredSize)
            /PortalDemoDefaultSize.poweredSize)+'px' ,
            maxWidth: 425, color: demoValue.poweredColor,textAlign: 'left'
          }}
          >
            {$t({ defaultMessage: 'Powered By' })}</UI.FieldText>}
          {demoValue.componentDisplay?.PoweredBy && <UI.Img src={demoValue.poweredImg}
            alt={$t({ defaultMessage: 'Powered by' })}
            style={{ marginLeft: 40/((demoValue.poweredImgSize ||
               PortalDemoDefaultSize.poweredImgSize)/PortalDemoDefaultSize.poweredImgSize),
            height: (demoValue.poweredImgSize || PortalDemoDefaultSize.poweredImgSize),
            maxWidth: 425
            }}
          ></UI.Img>}</div></UI.SelectedDiv>}
    </UI.LayoutViewContent>
  )
}

