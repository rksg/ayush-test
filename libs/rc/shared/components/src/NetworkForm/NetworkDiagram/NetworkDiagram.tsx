import { useContext, useState } from 'react'

import { Row, Col, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Button }       from '@acx-ui/components'
import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  networkTypes,
  WlanSecurityEnum,
  PskWlanSecurityEnum
} from '@acx-ui/rc/utils'

import AaaProxyDiagram                 from '../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                      from '../assets/images/network-wizard-diagrams/aaa.png'
import ClickThroughWithOweDiagram      from '../assets/images/network-wizard-diagrams/click-through-owe.png'
import ClickThroughWithPskDiagram      from '../assets/images/network-wizard-diagrams/click-through-psk.png'
import ClickThroughDiagram             from '../assets/images/network-wizard-diagrams/click-through.png'
import CloudpathWithOweDiagram         from '../assets/images/network-wizard-diagrams/cloudpath-owe.png'
import CloudpathProxyWithOweDiagram    from '../assets/images/network-wizard-diagrams/cloudpath-proxy-owe.png'
import CloudpathProxyWithPskDiagram    from '../assets/images/network-wizard-diagrams/cloudpath-proxy-psk.png'
import CloudpathProxyDiagram           from '../assets/images/network-wizard-diagrams/cloudpath-proxy.png'
import CloudpathWithPskDiagram         from '../assets/images/network-wizard-diagrams/cloudpath-psk.png'
import CloudpathDiagram                from '../assets/images/network-wizard-diagrams/cloudpath.png'
import DirectoryServerWithOweDiagram   from '../assets/images/network-wizard-diagrams/directoryserver-owe.png'
import DirectoryServerWithPskDiagram   from '../assets/images/network-wizard-diagrams/directoryserver-psk.png'
import DirectoryServerDiagram          from '../assets/images/network-wizard-diagrams/directoryserver.png'
import DpskCloudpathNonProxyDiagram    from '../assets/images/network-wizard-diagrams/dpsk-cloudpath-non-proxy.png'
import DpskUsingRadiusNonProxyDiagram  from '../assets/images/network-wizard-diagrams/dpsk-using-radius-non-proxy.png'
import DpskUsingRadiusDiagram          from '../assets/images/network-wizard-diagrams/dpsk-using-radius.png'
import DpskDiagram                     from '../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassWithOweDiagram         from '../assets/images/network-wizard-diagrams/guest-pass-owe.png'
import GuestPassWithPskDiagram         from '../assets/images/network-wizard-diagrams/guest-pass-psk.png'
import GuestPassDiagram                from '../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalWithOweDiagram      from '../assets/images/network-wizard-diagrams/host-approval-owe.png'
import HostApprovalWithPskDiagram      from '../assets/images/network-wizard-diagrams/host-approval-psk.png'
import HostApprovalDiagram             from '../assets/images/network-wizard-diagrams/host-approval.png'
import Hotspot20Diagram                from '../assets/images/network-wizard-diagrams/hotspot2.0.png'
import DefaultDiagram                  from '../assets/images/network-wizard-diagrams/none.png'
import OpenDiagram                     from '../assets/images/network-wizard-diagrams/open.png'
import PskDiagram                      from '../assets/images/network-wizard-diagrams/psk.png'
import SAMLWithOweDiagram              from '../assets/images/network-wizard-diagrams/saml-owe.png'
import SAMLWithPskDiagram              from '../assets/images/network-wizard-diagrams/saml-psk.png'
import SAMLDiagram                     from '../assets/images/network-wizard-diagrams/saml.png'
import SelfSignInWithOweDiagram        from '../assets/images/network-wizard-diagrams/self-sign-in-owe.png'
import SelfSignInWithPskDiagram        from '../assets/images/network-wizard-diagrams/self-sign-in-psk.png'
import SelfSignInDiagram               from '../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithAlwaysAcceptOweDiagram from '../assets/images/network-wizard-diagrams/wispr-always-accept-owe.png'
import WISPrWithAlwaysAcceptPskDiagram from '../assets/images/network-wizard-diagrams/wispr-always-accept-psk.png'
import WISPrWithAlwaysAcceptDiagram    from '../assets/images/network-wizard-diagrams/wispr-always-accept.png'
import WISPrWithOweDiagram             from '../assets/images/network-wizard-diagrams/wispr-owe.png'
import WISPrWithPskDiagram             from '../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                    from '../assets/images/network-wizard-diagrams/wispr.png'
import WorkflowWithOweDiagram          from '../assets/images/network-wizard-diagrams/workflow-owe.png'
import WorkflowProxyWithOweDiagram     from '../assets/images/network-wizard-diagrams/workflow-proxy-owe.png'
import WorkflowProxyWithPskDiagram     from '../assets/images/network-wizard-diagrams/workflow-proxy-psk.png'
import WorkflowProxyDiagram            from '../assets/images/network-wizard-diagrams/workflow-proxy.png'
import WorkflowWithPskDiagram          from '../assets/images/network-wizard-diagrams/workflow-psk.png'
import WorkflowDiagram                 from '../assets/images/network-wizard-diagrams/workflow.png'
import NetworkFormContext              from '../NetworkFormContext'
import { Diagram }                     from '../styledComponents'


interface DiagramProps {
  type?: NetworkTypeEnum;
  forceHideAAAButton?: boolean;
}

interface DefaultDiagramProps extends DiagramProps {
}
interface DpskDiagramProps extends DiagramProps {
  isCloudpathEnabled?: boolean;
  enableAuthProxy?: boolean;
  enableAccountingProxy?: boolean;
  enableAaaAuthBtn?: boolean;
  wlanSecurity?: WlanSecurityEnum
}

interface OpenDiagramProps extends DiagramProps {
}

interface PskDiagramProps extends DiagramProps {
  enableMACAuth?: boolean;
}
interface AaaDiagramProps extends DiagramProps {
  enableAuthProxy?: boolean;
  enableAccountingProxy?: boolean;
  enableAaaAuthBtn?: boolean;
  showButtons?: boolean;
}
interface CaptivePortalDiagramProps extends DiagramProps {
  networkPortalType?: GuestNetworkTypeEnum
  wlanSecurity?: WlanSecurityEnum
  wisprWithAlwaysAccept?: boolean
}

type NetworkDiagramProps = DefaultDiagramProps
  | DpskDiagramProps
  | OpenDiagramProps
  | PskDiagramProps
  | AaaDiagramProps
  | CaptivePortalDiagramProps

function getDiagram (props: NetworkDiagramProps) {
  switch (props.type) {
    case NetworkTypeEnum.DPSK:
      return getDPSKDiagram(props)
    case NetworkTypeEnum.PSK:
      return getPSKDiagram(props)
    case NetworkTypeEnum.OPEN:
      return getOpenDiagram(props)
    case NetworkTypeEnum.AAA:
      return getAAADiagram(props)
    case NetworkTypeEnum.HOTSPOT20:
      return Hotspot20Diagram
    case NetworkTypeEnum.CAPTIVEPORTAL:
      return getCaptivePortalDiagram(props)
    default:
      return DefaultDiagram
  }
}

function getDPSKDiagram (props:DpskDiagramProps) {
  return props?.isCloudpathEnabled ? getDpskUsingRadiusDiagram(props) : DpskDiagram
}
function getDpskUsingRadiusDiagram (props: DpskDiagramProps) {
  const enableAuthProxyService = props.enableAuthProxy && props.enableAaaAuthBtn
  const enableAccProxyService = props.enableAccountingProxy && !props.enableAaaAuthBtn
  if (props.wlanSecurity === WlanSecurityEnum.WPA23Mixed) {
    return DpskCloudpathNonProxyDiagram
  } else {
    return enableAuthProxyService || enableAccProxyService ?
      DpskUsingRadiusDiagram : DpskUsingRadiusNonProxyDiagram
  }
}
function getPSKDiagram (props: PskDiagramProps) {
  return props?.enableMACAuth ? AaaDiagram : PskDiagram
}
function getOpenDiagram (props: PskDiagramProps) {
  return props?.enableMACAuth ? getAAADiagram(props) : OpenDiagram
}
function getAAADiagram (props: AaaDiagramProps) {
  if (props.showButtons) {
    const enableAuthProxyService = props.enableAuthProxy && props.enableAaaAuthBtn
    const enableAccProxyService = props.enableAccountingProxy && !props.enableAaaAuthBtn
    return enableAuthProxyService || enableAccProxyService ? AaaProxyDiagram : AaaDiagram
  }
  return props.enableAuthProxy ? AaaProxyDiagram : AaaDiagram
}
function getCloudpathDiagram (wisprWithPsk: boolean, wisprWithOwe: boolean,
  props: AaaDiagramProps) {
  let useProxy = props.enableAuthProxy
  if (props.showButtons) {
    const enableAuthProxyService = !!(props.enableAuthProxy && props.enableAaaAuthBtn)
    const enableAccProxyService = !!(props.enableAccountingProxy && !props.enableAaaAuthBtn)
    useProxy = enableAuthProxyService || enableAccProxyService
  }
  if (useProxy) {
    return wisprWithPsk ? CloudpathProxyWithPskDiagram :
      (wisprWithOwe ? CloudpathProxyWithOweDiagram : CloudpathProxyDiagram)
  } else {
    return wisprWithPsk ? CloudpathWithPskDiagram :
      (wisprWithOwe ? CloudpathWithOweDiagram : CloudpathDiagram)
  }
}

function getWorkflowDiagram (wisprWithPsk: boolean, wisprWithOwe: boolean,
  props: AaaDiagramProps) {
  let useProxy = props.enableAccountingProxy
  if(useProxy) {
    return wisprWithPsk ? WorkflowProxyWithPskDiagram :
      (wisprWithOwe ? WorkflowProxyWithOweDiagram : WorkflowProxyDiagram)
  } else {
    return wisprWithPsk ? WorkflowWithPskDiagram :
      (wisprWithOwe ? WorkflowWithOweDiagram : WorkflowDiagram)
  }
}
function getCaptivePortalDiagram (props: CaptivePortalDiagramProps) {
  const type = props.networkPortalType as GuestNetworkTypeEnum
  const wlanSecurity = props.wlanSecurity as WlanSecurityEnum
  const wisprWithPsk=Object.keys(PskWlanSecurityEnum)
    .includes(wlanSecurity as keyof typeof PskWlanSecurityEnum)
  const wisprWithOwe=
    (wlanSecurity === WlanSecurityEnum.OWE) || (wlanSecurity === WlanSecurityEnum.OWETransition)

  const CaptivePortalDiagramMap: Partial<Record<GuestNetworkTypeEnum, string>> = {
    [GuestNetworkTypeEnum.ClickThrough]: wisprWithPsk ? ClickThroughWithPskDiagram :
      (wisprWithOwe ? ClickThroughWithOweDiagram : ClickThroughDiagram),
    [GuestNetworkTypeEnum.SelfSignIn]: wisprWithPsk ? SelfSignInWithPskDiagram :
      (wisprWithOwe ? SelfSignInWithOweDiagram : SelfSignInDiagram),
    [GuestNetworkTypeEnum.HostApproval]: wisprWithPsk ? HostApprovalWithPskDiagram :
      (wisprWithOwe ? HostApprovalWithOweDiagram : HostApprovalDiagram),
    [GuestNetworkTypeEnum.GuestPass]: wisprWithPsk ? GuestPassWithPskDiagram :
      (wisprWithOwe ? GuestPassWithOweDiagram : GuestPassDiagram),
    [GuestNetworkTypeEnum.Cloudpath]: getCloudpathDiagram(wisprWithPsk, wisprWithOwe, props),
    [GuestNetworkTypeEnum.WISPr]: props.wisprWithAlwaysAccept ?
      (wisprWithPsk ? WISPrWithAlwaysAcceptPskDiagram :
        (wisprWithOwe ? WISPrWithAlwaysAcceptOweDiagram : WISPrWithAlwaysAcceptDiagram)) :
      (wisprWithPsk ? WISPrWithPskDiagram : (wisprWithOwe ? WISPrWithOweDiagram : WISPrDiagram)),
    [GuestNetworkTypeEnum.Directory]: wisprWithOwe ? DirectoryServerWithOweDiagram
      : ( wisprWithPsk ? DirectoryServerWithPskDiagram : DirectoryServerDiagram),
    [GuestNetworkTypeEnum.SAML]: wisprWithOwe ? SAMLWithOweDiagram
      : (wisprWithPsk ? SAMLWithPskDiagram : SAMLDiagram),
    [GuestNetworkTypeEnum.Workflow]: getWorkflowDiagram(wisprWithPsk, wisprWithOwe, props)
  }
  return CaptivePortalDiagramMap[type] || ClickThroughDiagram
}

export function NetworkDiagram (props: NetworkDiagramProps) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const title = data?.type ? $t(networkTypes[data?.type]) : undefined
  const { forceHideAAAButton = false } = props

  const showButtons = !!data?.enableAuthProxy !== !!data?.enableAccountingProxy
  && data?.enableAccountingService && forceHideAAAButton
  const enableMACAuth = data?.wlan?.macAddressAuthentication

  const diagram = getDiagram({
    ...data,
    ...{ showButtons, enableAaaAuthBtn, enableMACAuth },
    ...props
  })


  function AaaButtons () {
    const { $t } = useIntl()
    return (
      <Space align='center' style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type='link' disabled={enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(true)}>
          { $t({ defaultMessage: 'Authentication Service' }) }
        </Button>
        <Button type='link' disabled={!enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(false)}>
          { $t({ defaultMessage: 'Accounting Service' }) }
        </Button>
      </Space>
    )
  }

  return (
    <Row justify='center'>
      <Col>
        <Diagram>
          {diagram && <img src={diagram} alt={title} />}
        </Diagram>
        {showButtons && <AaaButtons />}
      </Col>
    </Row>
  )
}
