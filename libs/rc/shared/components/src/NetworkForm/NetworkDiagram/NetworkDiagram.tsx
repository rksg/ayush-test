import { useContext, useState } from 'react'

import { Row, Col, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Button } from '@acx-ui/components'
import {
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  networkTypes
} from '@acx-ui/rc/utils'

import AaaProxyDiagram                from '../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                     from '../assets/images/network-wizard-diagrams/aaa.png'
import ClickThroughDiagram            from '../assets/images/network-wizard-diagrams/click-through.png'
import DpskUsingRadiusNonProxyDiagram from '../assets/images/network-wizard-diagrams/dpsk-using-radius-non-proxy.png'
import DpskUsingRadiusDiagram         from '../assets/images/network-wizard-diagrams/dpsk-using-radius.png'
import DpskDiagram                    from '../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassDiagram               from '../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalDiagram            from '../assets/images/network-wizard-diagrams/host-approval.png'
import Hotspot20Diagram               from '../assets/images/network-wizard-diagrams/hotspot2.0.png'
import DefaultDiagram                 from '../assets/images/network-wizard-diagrams/none.png'
import OpenDiagram                    from '../assets/images/network-wizard-diagrams/open.png'
import PskDiagram                     from '../assets/images/network-wizard-diagrams/psk.png'
import SelfSignInDiagram              from '../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithAlwaysAcceptDiagram   from '../assets/images/network-wizard-diagrams/wispr-always-accept.png'
import WISPrWithPskDiagram            from '../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                   from '../assets/images/network-wizard-diagrams/wispr.png'
import NetworkFormContext             from '../NetworkFormContext'
import { Diagram }                    from '../styledComponents'


interface DiagramProps {
  type?: NetworkTypeEnum;
}

interface DefaultDiagramProps extends DiagramProps {
}
interface DpskDiagramProps extends DiagramProps {
  isCloudpathEnabled?: boolean;
  enableAuthProxy?: boolean
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
  wisprWithPsk?: boolean
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
  return props?.isCloudpathEnabled ? (!!props?.enableAuthProxy? DpskUsingRadiusDiagram
    : DpskUsingRadiusNonProxyDiagram) : DpskDiagram
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

function getCaptivePortalDiagram (props: CaptivePortalDiagramProps) {
  const type = props.networkPortalType as GuestNetworkTypeEnum

  const CaptivePortalDiagramMap: Partial<Record<GuestNetworkTypeEnum, string>> = {
    [GuestNetworkTypeEnum.ClickThrough]: ClickThroughDiagram,
    [GuestNetworkTypeEnum.SelfSignIn]: SelfSignInDiagram,
    [GuestNetworkTypeEnum.HostApproval]: HostApprovalDiagram,
    [GuestNetworkTypeEnum.GuestPass]: GuestPassDiagram,
    [GuestNetworkTypeEnum.WISPr]: props.wisprWithAlwaysAccept?
      WISPrWithAlwaysAcceptDiagram : (props.wisprWithPsk ? WISPrWithPskDiagram : WISPrDiagram)
  }
  if(type === GuestNetworkTypeEnum.Cloudpath){
    return getAAADiagram(props)
  }
  else return CaptivePortalDiagramMap[type] || ClickThroughDiagram
}

export function NetworkDiagram (props: NetworkDiagramProps) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const title = data?.type ? $t(networkTypes[data?.type]) : undefined

  const showButtons = !!data?.enableAuthProxy !== !!data?.enableAccountingProxy
  && data?.enableAccountingService
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
