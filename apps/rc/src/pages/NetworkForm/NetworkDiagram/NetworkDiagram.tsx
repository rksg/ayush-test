import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { CloudpathServer } from '@acx-ui/rc/services'
import {
  CloudpathDeploymentTypeEnum,
  GuestNetworkTypeEnum,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'

import AaaCloudpathCloudDiagram      from '../../../assets/images/network-wizard-diagrams/aaa-cloudpath-cloud-deployment.png'
import AaaCloudpathOnPremDiagram     from '../../../assets/images/network-wizard-diagrams/aaa-cloudpath-on-prem-deployment.png'
import AaaProxyDiagram               from '../../../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                    from '../../../assets/images/network-wizard-diagrams/aaa.png'
import CaptiveCloudpathCloudDiagram  from '../../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-cloud-deployment.png'
import CaptiveCloudpathOnPremDiagram from '../../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-on-prem-deployment.png'
import ClickThroughDiagram           from '../../../assets/images/network-wizard-diagrams/click-through.png'
import DpskCloudpathCloudDiagram     from '../../../assets/images/network-wizard-diagrams/dpsk-cloudpath-cloud-deployment.png'
import DpskCloudpathOnPremDiagram    from '../../../assets/images/network-wizard-diagrams/dpsk-cloudpath-on-prem-deployment.png'
import DpskDiagram                   from '../../../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassDiagram              from '../../../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalDiagram           from '../../../assets/images/network-wizard-diagrams/host-approval.png'
import DefaultDiagram                from '../../../assets/images/network-wizard-diagrams/none.png'
import OpenCloudpathCloudDiagram     from '../../../assets/images/network-wizard-diagrams/open-cloudpath-cloud-deployment.png'
import OpenCloudpathOnPremDiagram    from '../../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import OpenDiagram                   from '../../../assets/images/network-wizard-diagrams/open.png'
import PskDiagram                    from '../../../assets/images/network-wizard-diagrams/psk.png'
import SelfSignInDiagram             from '../../../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithPskDiagram           from '../../../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                  from '../../../assets/images/network-wizard-diagrams/wispr.png'
import { networkTypes }              from '../contentsMap'
import { Diagram }                   from '../styledComponents'

interface DiagramProps {
  type?: NetworkTypeEnum;
  cloudpathType?: CloudpathServer['deploymentType'];
}

interface DefaultDiagramProps extends DiagramProps {
  type: undefined;
}
interface DpskDiagramProps extends DiagramProps {
  type: NetworkTypeEnum.DPSK;
}

interface OpenDiagramProps extends DiagramProps {
  type: NetworkTypeEnum.OPEN;
}

interface PskDiagramProps extends DiagramProps {
  type: NetworkTypeEnum.PSK;
  enableMACAuth?: boolean;
}
interface AaaDiagramProps extends DiagramProps {
  type: NetworkTypeEnum.AAA;
  enableAuthProxy?: boolean;
  enableAccountingProxy?: boolean;
  enableAaaAuthBtn?: boolean;
  showButtons?: boolean;
}
interface CaptivePortalDiagramProps extends DiagramProps {
  type: NetworkTypeEnum.CAPTIVEPORTAL;
  networkPortalType?: GuestNetworkTypeEnum;
  wisprWithPsk?: boolean;
}

type NetworkDiagramProps = DefaultDiagramProps
  | DpskDiagramProps
  | OpenDiagramProps
  | PskDiagramProps
  | AaaDiagramProps
  | CaptivePortalDiagramProps

const CloudpathCloudDiagramMap: Partial<Record<NetworkTypeEnum, string>> = {
  [NetworkTypeEnum.DPSK]: DpskCloudpathCloudDiagram,
  [NetworkTypeEnum.OPEN]: OpenCloudpathCloudDiagram,
  [NetworkTypeEnum.AAA]: AaaCloudpathCloudDiagram,
  [NetworkTypeEnum.CAPTIVEPORTAL]: CaptiveCloudpathCloudDiagram
}

const CloudpathOnPremDiagramMap: Partial<Record<NetworkTypeEnum, string>> = {
  [NetworkTypeEnum.DPSK]: DpskCloudpathOnPremDiagram,
  [NetworkTypeEnum.OPEN]: OpenCloudpathOnPremDiagram,
  [NetworkTypeEnum.AAA]: AaaCloudpathOnPremDiagram,
  [NetworkTypeEnum.CAPTIVEPORTAL]: CaptiveCloudpathOnPremDiagram
}

function getDiagram (props: NetworkDiagramProps) {
  let diagram = null
  switch (props.type) {
    case NetworkTypeEnum.DPSK:
      diagram = DpskDiagram
      break
    case NetworkTypeEnum.PSK:
      diagram = getPSKDiagram(props)
      break
    case NetworkTypeEnum.OPEN:
      diagram = OpenDiagram
      break
    case NetworkTypeEnum.AAA:
      diagram = getAAADiagram(props)
      break
    case NetworkTypeEnum.CAPTIVEPORTAL:
      diagram = getCaptivePortalDiagram(props)
      break
    default:
      diagram = DefaultDiagram
  }

  if (props.type && props?.cloudpathType) {
    const isCloudDeployment = props.cloudpathType === CloudpathDeploymentTypeEnum.Cloud
    const cloudpathMap = isCloudDeployment ? CloudpathCloudDiagramMap : CloudpathOnPremDiagramMap
    return cloudpathMap[props.type]
  }

  return diagram
}

function getPSKDiagram (props: PskDiagramProps) {
  return props?.enableMACAuth ? AaaDiagram : PskDiagram
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
  const isCloudDeployment = props.cloudpathType === CloudpathDeploymentTypeEnum.Cloud

  const CaptivePortalDiagramMap: Partial<Record<GuestNetworkTypeEnum, string>> = {
    [GuestNetworkTypeEnum.ClickThrough]: ClickThroughDiagram,
    [GuestNetworkTypeEnum.SelfSignIn]: SelfSignInDiagram,
    [GuestNetworkTypeEnum.HostApproval]: HostApprovalDiagram,
    [GuestNetworkTypeEnum.GuestPass]: GuestPassDiagram,
    [GuestNetworkTypeEnum.WISPr]: props.wisprWithPsk ? WISPrWithPskDiagram : WISPrDiagram,
    [GuestNetworkTypeEnum.Cloudpath]: isCloudDeployment ?
      CaptiveCloudpathCloudDiagram : CaptiveCloudpathOnPremDiagram
  }
  return CaptivePortalDiagramMap[type] || ClickThroughDiagram
}

export function NetworkDiagram (props: NetworkDiagramProps) {
  const { $t } = useIntl()
  const title = props.type ? $t(networkTypes[props.type]) : undefined
  const diagram = getDiagram({ ...props })

  return (
    <Row justify='center'>
      <Col>
        <Diagram>
          {diagram && <img src={diagram} alt={title} />}
        </Diagram>
      </Col>
    </Row>
  )
}
