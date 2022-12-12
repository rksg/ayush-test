import { Demo, GuestNetworkTypeEnum, PortalViewEnum } from '@acx-ui/rc/utils'

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
  networkSocial?: { [key:string]:boolean },
  networkViewType?: GuestNetworkTypeEnum,
  view: PortalViewEnum,
  demoValue: Demo,
  isPreview?:boolean
}) {
  const { view, demoValue, networkViewType,networkSocial } = props
  const componentDisplay = demoValue?.componentDisplay
  const isbg = demoValue?.bgImage ? 'true' : 'false'
  return (
    <UI.LayoutViewContent isbg={isbg}>
      {componentDisplay.wifi4eu && <UI.Img src={Wifi4eu}
        alt={'Wifi4eu'}
        height={120} />}
      {componentDisplay.logo &&<UI.Img src={demoValue.logo}
        alt={'Logo'}
        style={{ height: (demoValue.logoRatio||PortalDemoDefaultSize.logoRatio) ,maxWidth: 425 }}
      />}
      {componentDisplay.welcome && <div
        style={{ minHeight: 25 * ((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize) , outline: 0, textAlign: 'center',
        lineHeight: 20*((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize) + 'px',
        width: 310*((demoValue.welcomeSize)
          /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize) }}
      >{demoValue.welcomeText}</div>}
      {componentDisplay.photo &&<UI.Img src={demoValue.photo}
        alt={'Photo png'}
        style={{ height: (demoValue.photoRatio||PortalDemoDefaultSize.photoRatio) ,
          maxWidth: 425 }}
      />}
      {componentDisplay.secondaryText &&<UI.FieldText
        style={{ lineHeight: 16 * ((demoValue.secondarySize||
          PortalDemoDefaultSize.secondarySize)/PortalDemoDefaultSize.secondarySize)+'px' ,
        maxWidth: 425, color: demoValue.secondaryColor,
        fontSize: (demoValue.secondarySize||PortalDemoDefaultSize.secondarySize) }}
      >{demoValue.secondaryText}
      </UI.FieldText>}
      {((view === PortalViewEnum.ClickThrough && !networkViewType) ||
        networkViewType === GuestNetworkTypeEnum.ClickThrough) && <PortalViewGoThrough
        demoValue={demoValue}
        isPreview={true}
      />}
      {((view === PortalViewEnum.GuestPassConnect && !networkViewType) ||
        networkViewType === GuestNetworkTypeEnum.GuestPass) && <PortalViewGuestConnect
        demoValue={demoValue}
        isPreview={true}
      />}
      {view === PortalViewEnum.GuestPassForgot && <PortalViewGuestForget
        demoValue={demoValue}
        isPreview={true}
      />}
      {((view === PortalViewEnum.SelfSignIn && !networkViewType) ||
        networkViewType === GuestNetworkTypeEnum.SelfSignIn) &&
      <PortalViewSelfSignConnect networkSocial={networkSocial}/>}
      {view === PortalViewEnum.SelfSignInRegister &&
      <PortalViewSelfSignRegister
        demoValue={demoValue}
        isPreview={true}
      />}
      {((view === PortalViewEnum.HostApproval && !networkViewType) ||
        networkViewType === GuestNetworkTypeEnum.HostApproval) &&
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
      {componentDisplay.termsConditions &&<UI.FieldText>{
        'By clicking the connect button, you are accepting the'
      }&nbsp;&nbsp;
      <UI.FieldTextLink>
        {'terms & conditions'}
      </UI.FieldTextLink></UI.FieldText>}
      {componentDisplay.poweredBy && <UI.SelectedDiv style={{ paddingLeft: 200/((
        demoValue.poweredImgRatio)/PortalDemoDefaultSize.poweredImgRatio) }}>
        <div style={{ backgroundColor: demoValue.poweredBgColor }}>
          {componentDisplay.poweredBy &&<UI.FieldText style={{
            fontSize: (demoValue.poweredSize),
            lineHeight: 24 * ((demoValue.poweredSize)
            /PortalDemoDefaultSize.poweredSize)+'px' ,
            maxWidth: 425, color: demoValue.poweredColor,textAlign: 'left'
          }}
          >
            {'Powered By'}</UI.FieldText>}
          {componentDisplay.poweredBy && <UI.Img src={demoValue.poweredImg}
            alt={'Powered by'}
            style={{ marginLeft:
              40/(demoValue.poweredImgRatio/PortalDemoDefaultSize.poweredImgRatio),
            height: demoValue.poweredImgRatio,maxWidth: 425
            }}
          ></UI.Img>}</div></UI.SelectedDiv>}
    </UI.LayoutViewContent>
  )
}

