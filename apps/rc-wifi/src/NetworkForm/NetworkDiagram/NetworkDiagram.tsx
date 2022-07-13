import React, { useState } from 'react'

import { Row, Col, Space } from 'antd'

import { Button }          from '@acx-ui/components'
import { CloudpathServer } from '@acx-ui/rc/services'
import {
  CloudpathDeploymentTypeEnum,
  GuestNetworkTypeEnum,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'

import AaaCloudpathCloudDiagram      from '../../assets/images/network-wizard-diagrams/aaa-cloudpath-cloud-deployment.png'
import AaaCloudpathOnPremDiagram     from '../../assets/images/network-wizard-diagrams/aaa-cloudpath-on-prem-deployment.png'
import AaaProxyDiagram               from '../../assets/images/network-wizard-diagrams/aaa-proxy.png'
import AaaDiagram                    from '../../assets/images/network-wizard-diagrams/aaa.png'
import CaptiveCloudpathCloudDiagram  from '../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-cloud-deployment.png'
import CaptiveCloudpathOnPremDiagram from '../../assets/images/network-wizard-diagrams/captive-portal-cloudpath-on-prem-deployment.png'
import ClickThroughDiagram           from '../../assets/images/network-wizard-diagrams/click-through.png'
import DpskCloudpathCloudDiagram     from '../../assets/images/network-wizard-diagrams/dpsk-cloudpath-cloud-deployment.png'
import DpskCloudpathOnPremDiagram    from '../../assets/images/network-wizard-diagrams/dpsk-cloudpath-on-prem-deployment.png'
import DpskDiagram                   from '../../assets/images/network-wizard-diagrams/dpsk.png'
import GuestPassDiagram              from '../../assets/images/network-wizard-diagrams/guest-pass.png'
import HostApprovalDiagram           from '../../assets/images/network-wizard-diagrams/host-approval.png'
import DefaultDiagram                from '../../assets/images/network-wizard-diagrams/none.png'
import OpenCloudpathCloudDiagram     from '../../assets/images/network-wizard-diagrams/open-cloudpath-cloud-deployment.png'
import OpenCloudpathOnPremDiagram    from '../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import OpenDiagram                   from '../../assets/images/network-wizard-diagrams/open.png'
import PskDiagram                    from '../../assets/images/network-wizard-diagrams/psk.png'
import SelfSignInDiagram             from '../../assets/images/network-wizard-diagrams/self-sign-in.png'
import WISPrWithPskDiagram           from '../../assets/images/network-wizard-diagrams/wispr-psk.png'
import WISPrDiagram                  from '../../assets/images/network-wizard-diagrams/wispr.png'
import { NetworkTypeLabel }          from '../contentsMap'
import { Diagram }                   from '../styledComponents'

interface NetworkDiagramProps {
  type: NetworkTypeEnum
  cloudpathType?: CloudpathServer['deploymentType']
  networkPortalType?: GuestNetworkTypeEnum
  wisprWithPsk?: boolean
  enableAuthProxy?: boolean
  enableAccountingService?: boolean
  enableAccountingProxy?: boolean
  enableMACAuth?: boolean
  enableAaaAuthBtn?: boolean
  showAaaButton?: boolean
}

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
  const diagramMap: Partial<Record<NetworkTypeEnum, string>> = {
    [NetworkTypeEnum.PSK]: props.enableMACAuth ? AaaDiagram : PskDiagram,
    [NetworkTypeEnum.DPSK]: DpskDiagram,
    [NetworkTypeEnum.OPEN]: OpenDiagram,
    [NetworkTypeEnum.AAA]: getAAADiagram(props),
    [NetworkTypeEnum.CAPTIVEPORTAL]: getCaptivePortalDiagram(props)
  }

  if (props?.cloudpathType) {
    const isCloudDeployment = props?.cloudpathType === CloudpathDeploymentTypeEnum.Cloud
    const cloudpathMap = isCloudDeployment ? CloudpathCloudDiagramMap : CloudpathOnPremDiagramMap
    return cloudpathMap[props?.type]
  }

  return diagramMap[props.type] || DefaultDiagram
}

function getAAADiagram (props: NetworkDiagramProps) {
  if (props.showAaaButton) {
    const enableAuthProxyService = props.enableAuthProxy && props.enableAaaAuthBtn
    const enableAccProxyService = props.enableAccountingProxy && !props.enableAaaAuthBtn
    return enableAuthProxyService || enableAccProxyService ? AaaProxyDiagram : AaaDiagram
  }
  return props.enableAuthProxy ? AaaProxyDiagram : AaaDiagram
}

function getCaptivePortalDiagram (props: NetworkDiagramProps) {
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
  const [enableAaaAuthBtn, setEnableAaaAuthBtn] = useState(true)
  const type = props.type as NetworkTypeEnum
  const title = NetworkTypeLabel[type]
  const diagram = getDiagram({ ...props, enableAaaAuthBtn })

  function AaaButtons () {
    return (
      <Space align='center' style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type='link' disabled={enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(true)}>
          Authentication Service
        </Button>
        <Button type='link' disabled={!enableAaaAuthBtn} onClick={() => setEnableAaaAuthBtn(false)}>
          Accounting Service
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
        { props?.showAaaButton && <AaaButtons />}
      </Col>
    </Row>
  )
}