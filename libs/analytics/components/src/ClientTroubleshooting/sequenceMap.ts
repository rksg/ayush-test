import { MessageDescriptor, defineMessage } from 'react-intl'

export const nodeMap = (
  id: string,
  order: number,
  code: string,
  label: string | MessageDescriptor
) => ({ id, order, code, label })

/**
 * Reference: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?spaceKey=Team&title=RCCD+Enhancement+Feature%3A+Simplified+Message+Type
 */
export const RCCDNodeMap = {
  1: nodeMap('1', 0, 'CCD_MODULE_TYPE_UE', 'Client Device'),
  2: nodeMap('2', 1, 'CCD_MODULE_TYPE_AP', defineMessage({ defaultMessage: 'AP ({apMac})' })),
  3: nodeMap('3', 3, 'CCD_MODULE_TYPE_C_PLANE', 'Control Plane'),
  4: nodeMap('4', 2, 'CCD_MODULE_TYPE_D_PLANE', 'Data Plane'),
  5: nodeMap('5', 4, 'CCD_MODULE_TYPE_DHCP_SERVER', 'DHCP'),
  6: nodeMap('6', 5, 'CCD_MODULE_TYPE_RADIUS', 'AAA Server'),
  7: nodeMap('7', 6, 'CCD_MODULE_TYPE_LDAP', 'LDAP'),
  8: nodeMap('8', 7, 'CCD_MODULE_TYPE_ACTIVE_DIRECTORY', 'Active Directory Server'),
  9: nodeMap('9', 8, 'CCD_MODULE_TYPE_SUBSCRIBER_PORTAL', 'Captive Portal'),
  10: nodeMap('10', 9, 'CCD_MODULE_TYPE_OSU', 'OSU'),
  99: nodeMap('99', 10, 'CCD_MODULE_TYPE_BCAST', 'Broadcast')
}

const contentMap = (
  source: string,
  destination: string,
  label: string
) => ({ source, destination, label })

/**
* Reference: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?spaceKey=Team&title=RCCD+Enhancement+Feature%3A+Simplified+Message+Type
*/
export const RCCDContentMap = {
  1: contentMap('1', '2', 'Probe Request'),
  // 802.11 Authentication
  2: contentMap('1', '2', '802.11 Authentication Request'),
  3: contentMap('2', '1', '802.11 Authentication Response'),
  // 802.11 Association
  4: contentMap('1', '2', '802.11 Association Request'),
  5: contentMap('2', '1', '802.11 Association Response'),
  6: contentMap('1', '2', '802.11 Reassociation Request'),
  7: contentMap('2', '1', '802.11 Reassociation Response'),
  8: contentMap('2', '1', '802.11 Deauthentication'),
  9: contentMap('2', '1', '802.11 Disassociation'),
  10: contentMap('1', '2', '802.11 Deauthentication (Deauthentication_STA)'),
  11: contentMap('1', '2', '802.11 Disassociation (Disassociation_STA)'),
  // EAP 4-Way Handshake
  21: contentMap('2', '1', '4-Way Handshake - Frame 1'),
  22: contentMap('1', '2', '4-Way Handshake - Frame 2'),
  23: contentMap('2', '1', '4-Way Handshake - Frame 3'),
  24: contentMap('1', '2', '4-Way Handshake - Frame 4'),
  // DHCP
  31: contentMap('1', '99', 'DHCP Discover'),
  32: contentMap('5', '1', 'DHCP Offer'),
  33: contentMap('1', '99', 'DHCP Request'),
  34: contentMap('5', '1', 'DHCP Ack'),
  35: contentMap('5', '1', 'DHCP NAK'),
  36: contentMap('2', '1', 'DHCP_DONE'),
  37: contentMap('1', '4', 'DHCP Discover (DHCP_DISCOVER_IN_TUNN)'),
  38: contentMap('1', '4', 'DHCP Request (DHCP_REQUEST_IN_TUNN)'),
  // EAP
  41: contentMap('2', '1', 'EAP Request'),
  42: contentMap('1', '2', 'EAP Response'),
  43: contentMap('2', '1', 'EAP Success'),
  44: contentMap('2', '1', 'EAP Failure'),
  // RADIUS
  51: contentMap('2', '6', 'RADIUS Access Request'),
  52: contentMap('6', '2', 'RADIUS Access Challenge'),
  53: contentMap('6', '2', 'RADIUS Access Accept'),
  54: contentMap('6', '2', 'RADIUS Access Reject'),
  55: contentMap('2', '3', 'RADIUS Access Request (RADIUS_REQ_PROXY)'),
  56: contentMap('3', '2', 'RADIUS Access Challenge (RADIUS_CHALLENGE_PROXY)'),
  57: contentMap('3', '2', 'RADIUS Access Accept (RADIUS_ACCEPT_PROXY)'),
  58: contentMap('3', '2', 'RADIUS Access Reject (RADIUS_REJECT_PROXY)'),
  // User Authentication (webAuth & Guess)
  61: contentMap('1', '2', 'Authentication Request'),
  62: contentMap('2', '1', 'Authentication Success'),
  63: contentMap('2', '1', 'Authentication Failure'),
  64: contentMap('2', '3', 'IDM_REQ'),
  65: contentMap('3', '2', 'IDM_ACCEPT'),
  66: contentMap('3', '2', 'IDM_REJECT'),
  // Zero-IT File
  // NOTE: not supported
  // '71': contentMap(undefined, undefined, 'Zero-IT File Request'),
  // '72': contentMap(undefined, undefined, 'Zero-IT File Download'),
  // Hotspot2.0
  // NOTE: not supported
  // '81': contentMap(undefined, undefined, 'PPSMO Request'),
  // '82': contentMap(undefined, undefined, 'PPSMO Download'),
  // WISPr
  91: contentMap('1', '3', 'Message Redirect'),
  // Connection Finished
  254: contentMap('2', '1', 'The connection process is finished')
  // Monitor Ended
  // NOTE: not define on AP
  // '255': contentMap(
  //   undefined,
  //   undefined,
  //   'Message sent by CCD to DomainService to indicate the client monitoring has ended'
  // )
}

export const getRCCDFlow = ({ messageIds, failedMsgId }:
{
  messageIds: Array<string>,
  failedMsgId: string
}) => {
  const steps = messageIds.map(messageId => {
    const message = RCCDContentMap[messageId as unknown as keyof typeof RCCDContentMap]
    if (!message) return null
    return { ...message, state: messageId === failedMsgId ? 'failed' : 'normal' }
  }).filter(Boolean) as ({
    state: string;
    source: string;
    destination: string;
    label: string;
})[]

  const layers = Array.from(new Set(steps
    .map(step => [
      RCCDNodeMap[step.source as unknown as keyof typeof RCCDNodeMap],
      RCCDNodeMap[step.destination as unknown as keyof typeof RCCDNodeMap]
    ])
    .reduce((acc, set) => acc.concat(set), [])
    .filter(Boolean) // remove falsy values if any
    .sort((a, b) => a.order - b.order)
  ))

  return {
    layers: layers.map(v => v.label),
    steps: steps.map(({ source, destination, ...step }) => {
      const datum = {
        ...step,
        direction: source < destination ? 'right' : 'left',
        column: [
          layers.findIndex(layer => source === layer.id),
          layers.findIndex(layer => destination === layer.id)
        ].map(v => v + 1).sort()
      }
      return datum
    })
  }
}