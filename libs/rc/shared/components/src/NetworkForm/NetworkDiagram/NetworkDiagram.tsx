import { useContext, useState } from 'react'

import { Row, Col, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Button }   from '@acx-ui/components'
import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  networkTypes,
  WlanSecurityEnum,
  PskWlanSecurityEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import AaaCertAaaProxyDiagram            from '../assets/images/network-wizard-diagrams/aaa-cert-aaa-proxy.png'
import AaaCertAaaDiagram                 from '../assets/images/network-wizard-diagrams/aaa-cert-aaa.png'
import AaaCertDiagram                    from '../assets/images/network-wizard-diagrams/aaa-cert.png'
import AaaProxyDiagram                   from '../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                        from '../assets/images/network-wizard-diagrams/aaa.png'
import ClickThroughAaaProxyDiagram       from '../assets/images/network-wizard-diagrams/click-through-aaa-proxy.png'
import ClickThroughAaaDiagram            from '../assets/images/network-wizard-diagrams/click-through-aaa.png'
import ClickThroughOweAaaProxyDiagram    from '../assets/images/network-wizard-diagrams/click-through-owe-aaa-proxy.png'
import ClickThroughOweAaaDiagram         from '../assets/images/network-wizard-diagrams/click-through-owe-aaa.png'
import ClickThroughOweDiagram            from '../assets/images/network-wizard-diagrams/click-through-owe.png'
import ClickThroughPskAaaProxyDiagram    from '../assets/images/network-wizard-diagrams/click-through-psk-aaa-proxy.png'
import ClickThroughPskAaaDiagram         from '../assets/images/network-wizard-diagrams/click-through-psk-aaa.png'
import ClickThroughPskDiagram            from '../assets/images/network-wizard-diagrams/click-through-psk.png'
import ClickThroughDiagram               from '../assets/images/network-wizard-diagrams/click-through.png'
import CloudpathWithOweDiagram           from '../assets/images/network-wizard-diagrams/cloudpath-owe.png'
import CloudpathProxyWithOweDiagram      from '../assets/images/network-wizard-diagrams/cloudpath-proxy-owe.png'
import CloudpathProxyWithPskDiagram      from '../assets/images/network-wizard-diagrams/cloudpath-proxy-psk.png'
import CloudpathWithPskDiagram           from '../assets/images/network-wizard-diagrams/cloudpath-psk.png'
import DirectoryServerAaaProxyDiagram    from '../assets/images/network-wizard-diagrams/directory-server-aaa-proxy.png'
import DirectoryServerAaaDiagram         from '../assets/images/network-wizard-diagrams/directory-server-aaa.png'
import DirectoryServerOweAaaProxyDiagram from '../assets/images/network-wizard-diagrams/directory-server-owe-aaa-proxy.png'
import DirectoryServerOweAaaDiagram      from '../assets/images/network-wizard-diagrams/directory-server-owe-aaa.png'
import DirectoryServerOweDiagram         from '../assets/images/network-wizard-diagrams/directory-server-owe.png'
import DirectoryServerPskAaaProxyDiagram from '../assets/images/network-wizard-diagrams/directory-server-psk-aaa-proxy.png'
import DirectoryServerPskAaaDiagram      from '../assets/images/network-wizard-diagrams/directory-server-psk-aaa.png'
import DirectoryServerPskDiagram         from '../assets/images/network-wizard-diagrams/directory-server-psk.png'
import DirectoryServerDiagram            from '../assets/images/network-wizard-diagrams/directory-server.png'
import DpskAaaProxyDiagram               from '../assets/images/network-wizard-diagrams/dpsk-aaa-proxy.png'
import DpskAaaDiagram                    from '../assets/images/network-wizard-diagrams/dpsk-aaa.png'
import DpskCloudpathProxyDiagram         from '../assets/images/network-wizard-diagrams/dpsk-cloudpath-proxy.png'
import DpskCloudpathDiagram              from '../assets/images/network-wizard-diagrams/dpsk-cloudpath.png'
import DpskDiagram                       from '../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassAaaProxyDiagram          from '../assets/images/network-wizard-diagrams/guest-pass-aaa-proxy.png'
import GuestPassAaaDiagram               from '../assets/images/network-wizard-diagrams/guest-pass-aaa.png'
import GuestPassOweAaaProxyDiagram       from '../assets/images/network-wizard-diagrams/guest-pass-owe-aaa-proxy.png'
import GuestPassOweAaaDiagram            from '../assets/images/network-wizard-diagrams/guest-pass-owe-aaa.png'
import GuestPassOweDiagram               from '../assets/images/network-wizard-diagrams/guest-pass-owe.png'
import GuestPassPskAaaProxyDiagram       from '../assets/images/network-wizard-diagrams/guest-pass-psk-aaa-proxy.png'
import GuestPassPskAaaDiagram            from '../assets/images/network-wizard-diagrams/guest-pass-psk-aaa.png'
import GuestPassPskDiagram               from '../assets/images/network-wizard-diagrams/guest-pass-psk.png'
import GuestPassDiagram                  from '../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalAaaProxyDiagram       from '../assets/images/network-wizard-diagrams/host-approval-aaa-proxy.png'
import HostApprovalAaaDiagram            from '../assets/images/network-wizard-diagrams/host-approval-aaa.png'
import HostApprovalOweAaaProxyDiagram    from '../assets/images/network-wizard-diagrams/host-approval-owe-aaa-proxy.png'
import HostApprovalOweAaaDiagram         from '../assets/images/network-wizard-diagrams/host-approval-owe-aaa.png'
import HostApprovalOweDiagram            from '../assets/images/network-wizard-diagrams/host-approval-owe.png'
import HostApprovalPskAaaProxyDiagram    from '../assets/images/network-wizard-diagrams/host-approval-psk-aaa-proxy.png'
import HostApprovalPskAaaDiagram         from '../assets/images/network-wizard-diagrams/host-approval-psk-aaa.png'
import HostApprovalPskDiagram            from '../assets/images/network-wizard-diagrams/host-approval-psk.png'
import HostApprovalDiagram               from '../assets/images/network-wizard-diagrams/host-approval.png'
import Hotspot20Diagram                  from '../assets/images/network-wizard-diagrams/hotspot2.0.png'
import DefaultDiagram                    from '../assets/images/network-wizard-diagrams/none.png'
import OpenAaaProxyDiagram               from '../assets/images/network-wizard-diagrams/open-aaa-proxy.png'
import OpenAaaDiagram                    from '../assets/images/network-wizard-diagrams/open-aaa.png'
import OpenMacregAaaProxyDiagram         from '../assets/images/network-wizard-diagrams/open-macreg-aaa-proxy.png'
import OpenMacregAaaDiagram              from '../assets/images/network-wizard-diagrams/open-macreg-aaa.png'
import OpenMacregDiagram                 from '../assets/images/network-wizard-diagrams/open-macreg.png'
import OpenOweAaaProxyDiagram            from '../assets/images/network-wizard-diagrams/open-owe-aaa-proxy.png'
import OpenOweAaaDiagram                 from '../assets/images/network-wizard-diagrams/open-owe-aaa.png'
import OpenOweMacregAaaProxyDiagram      from '../assets/images/network-wizard-diagrams/open-owe-macreg-aaa-proxy.png'
import OpenOweMacregAaaDiagram           from '../assets/images/network-wizard-diagrams/open-owe-macreg-aaa.png'
import OpenOweMacregDiagram              from '../assets/images/network-wizard-diagrams/open-owe-macreg.png'
import OpenOweDiagram                    from '../assets/images/network-wizard-diagrams/open-owe.png'
import OpenDiagram                       from '../assets/images/network-wizard-diagrams/open.png'
import PskMacregAaaProxyDiagram          from '../assets/images/network-wizard-diagrams/psk-macreg-aaa-proxy.png'
import PskMacregAaaDiagram               from '../assets/images/network-wizard-diagrams/psk-macreg-aaa.png'
import PskMacregDiagram                  from '../assets/images/network-wizard-diagrams/psk-macreg.png'
import PskDiagram                        from '../assets/images/network-wizard-diagrams/psk.png'
import SamlAaaProxyDiagram               from '../assets/images/network-wizard-diagrams/saml-aaa-proxy.png'
import SamlAaaDiagram                    from '../assets/images/network-wizard-diagrams/saml-aaa.png'
import SamlOweAaaProxyDiagram            from '../assets/images/network-wizard-diagrams/saml-owe-aaa-proxy.png'
import SamlOweAaaDiagram                 from '../assets/images/network-wizard-diagrams/saml-owe-aaa.png'
import SamlOweDiagram                    from '../assets/images/network-wizard-diagrams/saml-owe.png'
import SamlPskAaaProxyDiagram            from '../assets/images/network-wizard-diagrams/saml-psk-aaa-proxy.png'
import SamlPskAaaDiagram                 from '../assets/images/network-wizard-diagrams/saml-psk-aaa.png'
import SamlPskDiagram                    from '../assets/images/network-wizard-diagrams/saml-psk.png'
import SamlDiagram                       from '../assets/images/network-wizard-diagrams/saml.png'
import SelfSignInAaaProxyDiagram         from '../assets/images/network-wizard-diagrams/self-sign-in-aaa-proxy.png'
import SelfSignInAaaDiagram              from '../assets/images/network-wizard-diagrams/self-sign-in-aaa.png'
import SelfSignInOweAaaProxyDiagram      from '../assets/images/network-wizard-diagrams/self-sign-in-owe-aaa-proxy.png'
import SelfSignInOweAaaDiagram           from '../assets/images/network-wizard-diagrams/self-sign-in-owe-aaa.png'
import SelfSignInOweDiagram              from '../assets/images/network-wizard-diagrams/self-sign-in-owe.png'
import SelfSignInPskAaaProxyDiagram      from '../assets/images/network-wizard-diagrams/self-sign-in-psk-aaa-proxy.png'
import SelfSignInPskAaaDiagram           from '../assets/images/network-wizard-diagrams/self-sign-in-psk-aaa.png'
import SelfSignInPskDiagram              from '../assets/images/network-wizard-diagrams/self-sign-in-psk.png'
import SelfSignInDiagram                 from '../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithAlwaysAcceptOweDiagram   from '../assets/images/network-wizard-diagrams/wispr-always-accept-owe.png'
import WISPrWithAlwaysAcceptPskDiagram   from '../assets/images/network-wizard-diagrams/wispr-always-accept-psk.png'
import WISPrWithAlwaysAcceptDiagram      from '../assets/images/network-wizard-diagrams/wispr-always-accept.png'
import WISPrWithOweDiagram               from '../assets/images/network-wizard-diagrams/wispr-owe.png'
import WISPrWithPskDiagram               from '../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                      from '../assets/images/network-wizard-diagrams/wispr.png'
import WorkflowAcctOffNoneDiagram        from '../assets/images/network-wizard-diagrams/workflow-acctoff-none.png'
import WorkflowAcctOffOweDiagram         from '../assets/images/network-wizard-diagrams/workflow-acctoff-owe.png'
import WorkflowAcctOffPskDiagram         from '../assets/images/network-wizard-diagrams/workflow-acctoff-psk.png'
import WorkflowAcctOnNoneDiagram         from '../assets/images/network-wizard-diagrams/workflow-accton-none.png'
import WorkflowAcctOnOweDiagram          from '../assets/images/network-wizard-diagrams/workflow-accton-owe.png'
import WorkflowAcctOnPskDiagram          from '../assets/images/network-wizard-diagrams/workflow-accton-psk.png'
import WorkflowAcctProxyNoneDiagram      from '../assets/images/network-wizard-diagrams/workflow-acctproxy-none.png'
import WorkflowAcctProxyOweDiagram       from '../assets/images/network-wizard-diagrams/workflow-acctproxy-owe.png'
import WorkflowAcctProxyPskDiagram       from '../assets/images/network-wizard-diagrams/workflow-acctproxy-psk.png'
import NetworkFormContext                from '../NetworkFormContext'
import { Diagram }                       from '../styledComponents'


interface DiagramProps {
  type?: NetworkTypeEnum;
  enableAuthProxy?: boolean;
  enableAccountingProxy?: boolean;
  enableAccountingService?: boolean
}

interface DefaultDiagramProps extends DiagramProps {
}
interface DpskDiagramProps extends DiagramProps {
  isCloudpathEnabled?: boolean;
  enableAaaAuthBtn?: boolean;
  wlanSecurity?: WlanSecurityEnum
}

interface MacAuthDiagramProps extends DiagramProps {
  enableMACAuth?: boolean
  isMacRegistrationList?: boolean
}

interface OpenDiagramProps extends MacAuthDiagramProps {
  enableOwe?: boolean
}

interface PskDiagramProps extends MacAuthDiagramProps {
}
interface AaaDiagramProps extends DiagramProps {
  enableAaaAuthBtn?: boolean
  showButtons?: boolean
  useCertificateTemplate?: boolean
}
interface CaptivePortalDiagramProps extends DiagramProps {
  networkPortalType?: GuestNetworkTypeEnum
  wlanSecurity?: WlanSecurityEnum
  wisprWithAlwaysAccept?: boolean
  networkSecurity?: string
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
  if (props?.isCloudpathEnabled) {
    return (props.wlanSecurity === WlanSecurityEnum.WPA23Mixed)?
      getAAADiagramByParams(props, DpskCloudpathProxyDiagram, DpskCloudpathDiagram)
      : getAAADiagramByParams(props, DpskCloudpathProxyDiagram, DpskAaaDiagram)
  } else {
    return (props?.enableAccountingService) ?
      getAAADiagramByParams(props, DpskAaaProxyDiagram, DpskAaaDiagram)
      : DpskDiagram
  }
}

function getPSKDiagram (props: PskDiagramProps) {
  if (props.enableMACAuth) {
    if (props.isMacRegistrationList) {
      return (props.enableAccountingService)?
        getAAADiagramByParams(props, PskMacregAaaProxyDiagram, PskMacregAaaDiagram) :
        PskMacregDiagram
    }
    return getCommonAAADiagram(props)
  }

  return (props.enableAccountingService) ? getCommonAAADiagram(props) : PskDiagram
}

function getOpenDiagram (props: OpenDiagramProps) {
  const diagramSet = props.enableOwe ? {
    OpenDiagram: OpenOweDiagram,
    OpenAaaProxyDiagram: OpenOweAaaProxyDiagram,
    OpenAaaDiagram: OpenOweAaaDiagram,
    OpenMacregDiagram: OpenOweMacregDiagram,
    OpenMacregAaaProxyDiagram: OpenOweMacregAaaProxyDiagram,
    OpenMacregAaaDiagram: OpenOweMacregAaaDiagram
  } : {
    OpenDiagram,
    OpenAaaProxyDiagram,
    OpenAaaDiagram,
    OpenMacregDiagram,
    OpenMacregAaaProxyDiagram,
    OpenMacregAaaDiagram
  }

  if (props.enableMACAuth && props.isMacRegistrationList) {
    return (props.enableAccountingService) ?
      getAAADiagramByParams(
        props, diagramSet.OpenMacregAaaProxyDiagram, diagramSet.OpenMacregAaaDiagram
      ) : diagramSet.OpenMacregDiagram
  }

  return (props.enableAccountingService) ?
    getAAADiagramByParams(
      props, diagramSet.OpenAaaProxyDiagram, diagramSet.OpenAaaDiagram
    ) : diagramSet.OpenDiagram
}

function getAAADiagramByParams (
  props: AaaDiagramProps,
  proxyDiagram: string,
  nonProxyDiagram: string) {

  if (props.showButtons) {
    const enableAuthProxyService = props.enableAuthProxy && props.enableAaaAuthBtn
    const enableAccProxyService = props.enableAccountingProxy && !props.enableAaaAuthBtn
    return enableAuthProxyService || enableAccProxyService ? proxyDiagram : nonProxyDiagram
  }

  const isProxyModeOn =
    (!props.showButtons && props.enableAccountingService)?
      props.enableAccountingProxy : props.enableAuthProxy

  return isProxyModeOn ? proxyDiagram : nonProxyDiagram
}

function getCommonAAADiagram (props: AaaDiagramProps) {
  return getAAADiagramByParams(props, AaaProxyDiagram, AaaDiagram)
}

function getAAADiagram (props: AaaDiagramProps) {
  if(props.useCertificateTemplate) {
    return (props.enableAccountingService) ?
      getAAADiagramByParams(props, AaaCertAaaProxyDiagram, AaaCertAaaDiagram) :
      AaaCertDiagram
  }

  return getCommonAAADiagram(props)
}

function getWorkflowDiagram (wisprWithPsk: boolean, wisprWithOwe: boolean,
  props: AaaDiagramProps) {
  let useProxy = props.enableAccountingProxy
  let useAcctService = props.enableAccountingService
  if(useProxy) {
    return wisprWithPsk ? WorkflowAcctProxyPskDiagram :
      (wisprWithOwe ? WorkflowAcctProxyOweDiagram : WorkflowAcctProxyNoneDiagram)
  } else {
    if(useAcctService) {
      return wisprWithPsk ? WorkflowAcctOnPskDiagram :
        (wisprWithOwe ? WorkflowAcctOnOweDiagram : WorkflowAcctOnNoneDiagram)
    } else {
      return wisprWithPsk ? WorkflowAcctOffPskDiagram :
        (wisprWithOwe ? WorkflowAcctOffOweDiagram : WorkflowAcctOffNoneDiagram)
    }
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
    [GuestNetworkTypeEnum.ClickThrough]: getClickThroughDiagram(props),
    [GuestNetworkTypeEnum.SelfSignIn]: getSelfSignInDiagram(props),
    [GuestNetworkTypeEnum.HostApproval]: getHostApprovalDiagram(props),
    [GuestNetworkTypeEnum.GuestPass]: getGuestPassDiagram(props),
    [GuestNetworkTypeEnum.Cloudpath]: getCloudpathDiagram(props),
    [GuestNetworkTypeEnum.WISPr]: props.wisprWithAlwaysAccept ?
      (wisprWithPsk ? WISPrWithAlwaysAcceptPskDiagram :
        (wisprWithOwe ? WISPrWithAlwaysAcceptOweDiagram : WISPrWithAlwaysAcceptDiagram)) :
      (wisprWithPsk ? WISPrWithPskDiagram : (wisprWithOwe ? WISPrWithOweDiagram : WISPrDiagram)),
    [GuestNetworkTypeEnum.Directory]: getDirectoryServerDiagram(props),
    [GuestNetworkTypeEnum.SAML]: getSamlDiagram(props),
    [GuestNetworkTypeEnum.Workflow]: getWorkflowDiagram(wisprWithPsk, wisprWithOwe, props)
  }
  return CaptivePortalDiagramMap[type] || ClickThroughDiagram
}
interface CaptivePortalDiagramSet {
  Diagram?: string;
  AaaProxyDiagram: string;
  AaaDiagram: string;
}

const captivePortalDiagramMapping: Record<string, CaptivePortalDiagramSet> = {

  // --- ClickThrough ---
  ClickThroughOWE: {
    Diagram: ClickThroughOweDiagram,
    AaaProxyDiagram: ClickThroughOweAaaProxyDiagram,
    AaaDiagram: ClickThroughOweAaaDiagram
  },
  ClickThroughPSK: {
    Diagram: ClickThroughPskDiagram,
    AaaProxyDiagram: ClickThroughPskAaaProxyDiagram,
    AaaDiagram: ClickThroughPskAaaDiagram
  },
  ClickThrough: {
    Diagram: ClickThroughDiagram,
    AaaProxyDiagram: ClickThroughAaaProxyDiagram,
    AaaDiagram: ClickThroughAaaDiagram
  },

  // --- SelfSignIn ---
  SelfSignInOWE: {
    Diagram: SelfSignInOweDiagram,
    AaaProxyDiagram: SelfSignInOweAaaProxyDiagram,
    AaaDiagram: SelfSignInOweAaaDiagram
  },
  SelfSignInPSK: {
    Diagram: SelfSignInPskDiagram,
    AaaProxyDiagram: SelfSignInPskAaaProxyDiagram,
    AaaDiagram: SelfSignInPskAaaDiagram
  },
  SelfSignIn: {
    Diagram: SelfSignInDiagram,
    AaaProxyDiagram: SelfSignInAaaProxyDiagram,
    AaaDiagram: SelfSignInAaaDiagram
  },

  // --- HostApproval ---
  HostApprovalOWE: {
    Diagram: HostApprovalOweDiagram,
    AaaProxyDiagram: HostApprovalOweAaaProxyDiagram,
    AaaDiagram: HostApprovalOweAaaDiagram
  },
  HostApprovalPSK: {
    Diagram: HostApprovalPskDiagram,
    AaaProxyDiagram: HostApprovalPskAaaProxyDiagram,
    AaaDiagram: HostApprovalPskAaaDiagram
  },
  HostApproval: {
    Diagram: HostApprovalDiagram,
    AaaProxyDiagram: HostApprovalAaaProxyDiagram,
    AaaDiagram: HostApprovalAaaDiagram
  },

  // --- GuestPass ---
  GuestPassOWE: {
    Diagram: GuestPassOweDiagram,
    AaaProxyDiagram: GuestPassOweAaaProxyDiagram,
    AaaDiagram: GuestPassOweAaaDiagram
  },
  GuestPassPSK: {
    Diagram: GuestPassPskDiagram,
    AaaProxyDiagram: GuestPassPskAaaProxyDiagram,
    AaaDiagram: GuestPassPskAaaDiagram
  },
  GuestPass: {
    Diagram: GuestPassDiagram,
    AaaProxyDiagram: GuestPassAaaProxyDiagram,
    AaaDiagram: GuestPassAaaDiagram
  },

  // --- DirectoryServer ---
  DirectoryServerOWE: {
    Diagram: DirectoryServerOweDiagram,
    AaaProxyDiagram: DirectoryServerOweAaaProxyDiagram,
    AaaDiagram: DirectoryServerOweAaaDiagram
  },
  DirectoryServerPSK: {
    Diagram: DirectoryServerPskDiagram,
    AaaProxyDiagram: DirectoryServerPskAaaProxyDiagram,
    AaaDiagram: DirectoryServerPskAaaDiagram
  },
  DirectoryServer: {
    Diagram: DirectoryServerDiagram,
    AaaProxyDiagram: DirectoryServerAaaProxyDiagram,
    AaaDiagram: DirectoryServerAaaDiagram
  },

  // --- Saml ---
  SamlOWE: {
    Diagram: SamlOweDiagram,
    AaaProxyDiagram: SamlOweAaaProxyDiagram,
    AaaDiagram: SamlOweAaaDiagram
  },
  SamlPSK: {
    Diagram: SamlPskDiagram,
    AaaProxyDiagram: SamlPskAaaProxyDiagram,
    AaaDiagram: SamlPskAaaDiagram
  },
  Saml: {
    Diagram: SamlDiagram,
    AaaProxyDiagram: SamlAaaProxyDiagram,
    AaaDiagram: SamlAaaDiagram
  },

  // --- Cloudpath ---
  CloudpathOWE: {
    AaaProxyDiagram: CloudpathProxyWithOweDiagram,
    AaaDiagram: CloudpathWithOweDiagram
  },
  CloudpathPSK: {
    AaaProxyDiagram: CloudpathProxyWithPskDiagram,
    AaaDiagram: CloudpathWithPskDiagram
  },
  Cloudpath: {
    AaaProxyDiagram: OpenAaaProxyDiagram,
    AaaDiagram: OpenAaaDiagram
  }
}

function createCaptivePortalDiagramGenerator (
  prefix: keyof typeof captivePortalDiagramMapping):
    (props: CaptivePortalDiagramProps) => string | undefined {
  return (props: CaptivePortalDiagramProps) => {
    const securityTypeKey: 'OWE' | 'PSK' | '' =
      props.networkSecurity === 'OWE' || props.networkSecurity === 'PSK' ?
        props.networkSecurity : ''
    const key = `${prefix}${securityTypeKey}`

    const diagrams = captivePortalDiagramMapping[key]

    return getCommonCaptivePortalDiagram(
      props, diagrams.AaaProxyDiagram, diagrams.AaaDiagram, diagrams.Diagram
    )
  }
}

function getCommonCaptivePortalDiagram (
  props: CaptivePortalDiagramProps,
  aaaProxyDiagram:string,
  aaaNonProxyDiagram:string,
  nonAaaDiagram?:string
) {

  return (
    props.networkPortalType === GuestNetworkTypeEnum.Cloudpath || props.enableAccountingService
  )? getAAADiagramByParams(props, aaaProxyDiagram, aaaNonProxyDiagram) : nonAaaDiagram
}

const getSelfSignInDiagram = createCaptivePortalDiagramGenerator('SelfSignIn')
const getHostApprovalDiagram = createCaptivePortalDiagramGenerator('HostApproval')
const getGuestPassDiagram = createCaptivePortalDiagramGenerator('GuestPass')
const getClickThroughDiagram = createCaptivePortalDiagramGenerator('ClickThrough')
const getDirectoryServerDiagram = createCaptivePortalDiagramGenerator('DirectoryServer')
const getSamlDiagram = createCaptivePortalDiagramGenerator('Saml')
const getCloudpathDiagram = createCaptivePortalDiagramGenerator('Cloudpath')

export function NetworkDiagram (props: NetworkDiagramProps) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const title = data?.type ? $t(networkTypes[data?.type]) : undefined
  const networkType = props.type ?? data?.type
  const enableAuthProxy = getEnableAuthProxy(props, data, networkType)
  const enableAccountingProxy = props.enableAccountingProxy ?? data?.enableAccountingProxy
  const enableAccountingService = props.enableAccountingService ?? data?.enableAccountingService

  const showButtons = (isForceHideButtons(props, networkType))? false :
    !!enableAuthProxy !== !!enableAccountingProxy
    && !!enableAccountingService

  const diagram = getDiagram({
    ...data,
    ...{ showButtons, enableAaaAuthBtn },
    ...props
  })

  function getEnableAuthProxy (
    props: NetworkDiagramProps, data: NetworkSaveData | null, networkType?:NetworkTypeEnum
  ) {
    if(networkType === NetworkTypeEnum.DPSK){
      return props.enableAuthProxy
    } else {
      return props.enableAuthProxy ?? data?.enableAuthProxy
    }
  }

  function isForceHideButtons (props: NetworkDiagramProps, networkType?:NetworkTypeEnum) {
    if(networkType === NetworkTypeEnum.PSK || networkType === NetworkTypeEnum.OPEN) {
      const macAuthProps = props as MacAuthDiagramProps
      return !(macAuthProps.enableMACAuth && !macAuthProps.isMacRegistrationList)
    }

    // Hide AAA button under Captive Portal
    if(props.type === NetworkTypeEnum.CAPTIVEPORTAL) {
      const cpProps = props as CaptivePortalDiagramProps

      return cpProps.networkPortalType !== GuestNetworkTypeEnum.Cloudpath &&
        cpProps.networkPortalType !== GuestNetworkTypeEnum.WISPr

    }

    if(networkType === NetworkTypeEnum.DPSK) {
      const dpskProps = props as DpskDiagramProps
      return !dpskProps.isCloudpathEnabled
    }

    if(networkType === NetworkTypeEnum.AAA) {
      const aaaProps = props as AaaDiagramProps
      return aaaProps.useCertificateTemplate
    }

    return false
  }

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
