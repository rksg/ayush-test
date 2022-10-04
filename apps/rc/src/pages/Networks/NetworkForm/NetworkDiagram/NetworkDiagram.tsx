import { useContext, useState } from 'react'

import { Row, Col, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Button }                from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import {
  CloudpathDeploymentTypeEnum,
  CloudpathServer,
  GuestNetworkTypeEnum,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import AaaCloudpathCloudDiagram      from '../../../../assets/images/network-wizard-diagrams/aaa-cloudpath-cloud-deployment.png'
import AaaCloudpathOnPremDiagram     from '../../../../assets/images/network-wizard-diagrams/aaa-cloudpath-on-prem-deployment.png'
import AaaProxyDiagram               from '../../../../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                    from '../../../../assets/images/network-wizard-diagrams/aaa.png'
import CaptiveCloudpathCloudDiagram  from '../../../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-cloud-deployment.png'
import CaptiveCloudpathOnPremDiagram from '../../../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-on-prem-deployment.png'
import ClickThroughDiagram           from '../../../../assets/images/network-wizard-diagrams/click-through.png'
import DpskCloudpathCloudDiagram     from '../../../../assets/images/network-wizard-diagrams/dpsk-cloudpath-cloud-deployment.png'
import DpskCloudpathOnPremDiagram    from '../../../../assets/images/network-wizard-diagrams/dpsk-cloudpath-on-prem-deployment.png'
import DpskDiagram                   from '../../../../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassDiagram              from '../../../../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalDiagram           from '../../../../assets/images/network-wizard-diagrams/host-approval.png'
import DefaultDiagram                from '../../../../assets/images/network-wizard-diagrams/none.png'
import OpenCloudpathCloudDiagram     from '../../../../assets/images/network-wizard-diagrams/open-cloudpath-cloud-deployment.png'
import OpenCloudpathOnPremDiagram    from '../../../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import OpenDiagram                   from '../../../../assets/images/network-wizard-diagrams/open.png'
import PskDiagram                    from '../../../../assets/images/network-wizard-diagrams/psk.png'
import SelfSignInDiagram             from '../../../../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithPskDiagram           from '../../../../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                  from '../../../../assets/images/network-wizard-diagrams/wispr.png'
import { networkTypes }              from '../contentsMap'
import NetworkFormContext            from '../NetworkFormContext'
import { Diagram }                   from '../styledComponents'


interface DiagramProps {
  type?: NetworkTypeEnum;
  cloudpathType?: CloudpathServer['deploymentType'];
}

interface DefaultDiagramProps extends DiagramProps {
}
interface DpskDiagramProps extends DiagramProps {
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
  const { data } = useContext(NetworkFormContext)
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const title = data?.type ? $t(networkTypes[data?.type]) : undefined

  const showButtons = data?.enableAuthProxy !== !!data?.enableAccountingProxy
  && data?.enableAccountingService && !data?.isCloudpathEnabled
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data: cloudData }) {
      return {
        selected: cloudData?.find((item: CloudpathServer) => item.id === data?.cloudpathServerId)
      }
    }
  })

  const enableMACAuth = data?.wlan?.macAddressAuthentication

  const diagram = getDiagram({
    ...data,
    ...{ showButtons, enableAaaAuthBtn, cloudpathType: selected?.deploymentType, enableMACAuth },
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
