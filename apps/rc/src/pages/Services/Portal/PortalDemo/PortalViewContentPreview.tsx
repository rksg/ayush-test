import { Demo, PortalViewEnum } from '@acx-ui/rc/utils'

import Wifi4eu                   from '../../../../assets/images/portal-demo/WiFi4euBanner.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'
import * as UI                   from '../styledComponents'

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
  const componentDisplay = demoValue?.componentDisplay
  const isbg = demoValue?.backgroundImage ? 'true' : 'false'
  return (
    <UI.LayoutViewContent isbg={isbg}>
      {componentDisplay.WiFi4EU && <UI.Img src={Wifi4eu}
        alt={'Wifi4eu'}
        height={120} />}
      {componentDisplay.Logo &&<UI.Img src={demoValue.logo}
        alt={'Logo'}
        style={{ height: (demoValue.logoSize||PortalDemoDefaultSize.logoSize) ,maxWidth: 425 }}
      />}
      {componentDisplay.WelcomeText && <div
        style={{ minHeight: 25 * ((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize) , outline: 0,
        lineHeight: 20*((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize) + 'px',
        width: 310*((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize) }}
      >{demoValue.welcomeText}</div>}
      {componentDisplay.Photo &&<UI.Img src={demoValue.photo}
        alt={'Photo png'}
        style={{ height: (demoValue.photoSize||PortalDemoDefaultSize.photoSize) ,
          maxWidth: 425 }}
      />}
      {componentDisplay.SecondaryText &&<UI.FieldText
        style={{ lineHeight: 16 * ((demoValue.secondarySize||
          PortalDemoDefaultSize.secondarySize)/PortalDemoDefaultSize.secondarySize)+'px' ,
        maxWidth: 425, color: demoValue.secondaryColor,
        fontSize: (demoValue.secondarySize||PortalDemoDefaultSize.secondarySize) }}
      >{demoValue.secondaryText}
      </UI.FieldText>}
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
      <PortalViewTerms
        demoValue={demoValue}
        isPreview={true}/>}
      {componentDisplay.TermsConditions &&<UI.FieldText>{
        'By clicking the connect button, you are accepting the'
      }&nbsp;&nbsp;
      <UI.FieldTextLink>
        {'terms & conditions'}
      </UI.FieldTextLink></UI.FieldText>}
      {componentDisplay.PoweredBy && <UI.SelectedDiv style={{ paddingLeft: 200/((
        demoValue.poweredImgSize)/PortalDemoDefaultSize.poweredImgSize) }}>
        <div style={{ backgroundColor: demoValue.poweredBackgroundColor }}>
          {componentDisplay.PoweredBy &&<UI.FieldText style={{
            fontSize: (demoValue.poweredSize),
            lineHeight: 24 * ((demoValue.poweredSize)
            /PortalDemoDefaultSize.poweredSize)+'px' ,
            maxWidth: 425, color: demoValue.poweredColor,textAlign: 'left'
          }}
          >
            {'Powered By'}</UI.FieldText>}
          {componentDisplay.PoweredBy && <UI.Img src={demoValue.poweredImg}
            alt={'Powered by'}
            style={{ marginLeft: 40/(demoValue.poweredImgSize/PortalDemoDefaultSize.poweredImgSize),
              height: demoValue.poweredImgSize,
              maxWidth: 425
            }}
          ></UI.Img>}</div></UI.SelectedDiv>}
    </UI.LayoutViewContent>
  )
}

