/* eslint-disable max-len */
export const mock_response={
  id: 'c98bf7394bbb4d37a4e69affbfd959ea',
  name: '',
  type: 'VLAN',
  content: '{"vlanId":"30","vlanName":"Visitors","ipv4DhcpSnooping":false,"arpInspection":false,"igmpSnooping":"none","multicastVersion":null,"spanningTreeProtocol":"none","ports":0,"title":"","vlanConfigName":"","switchFamilyModels":[]}',
  sessionId: 'f4efa3ad8bee42b0bf6f97fbd09ffd7d',
  requiredFields: [],
  dispatchContent: {
    switchFamilyModels: [],
    vlanId: '30',
    vlanConfigName: '',
    spanningTreeProtocol: 'none',
    ipv4DhcpSnooping: false,
    multicastVersion: null,
    vlanName: '',
    ports: 0,
    title: '',
    igmpSnooping: 'none',
    arpInspection: false
  }
}

export const mock_payload= '[{"id":"fefa24af6b564a65a98b677e9c87ec18","VLAN Name":"Hotel Staff","VLAN ID":"10","Purpose":"This VLAN is dedicated to the hotel staff, allowing them to communicate and access internal resources securely without interference from guest traffic."},{"id":"e0c0def5df314e2aa949b53d2b22a1a8","VLAN Name":"Visitor Network","VLAN ID":"20","Purpose":"This VLAN is for guests visiting the hotel, providing them with internet access while keeping their devices separate from the hotel\'s internal network."},{"id":"94b257f47a4c4fb8b5cdca48f6956eb8","VLAN Name":"Premium Access","VLAN ID":"30","Purpose":"This VLAN is designed for guests who have paid for premium services, offering them higher bandwidth and priority access to the network."},{"id":"f5f2c71522d14e079c3a21b0168a3c96","VLAN Name":"Smart Devices","VLAN ID":"40","Purpose":"This VLAN is specifically for smart devices such as IoT devices in the hotel, ensuring they operate on a separate network for security and performance."}]'

export const mock_vlan = {
  arpInspection: true,
  id: '832157f54e534a6f8f46c228760804b3',
  igmpSnooping: 'passive',
  ipv4DhcpSnooping: true,
  multicastVersion: 3,
  spanningTreeProtocol: 'stp',
  untaggedPorts: '1/1/7',
  switchVlanPortModels: [{
    id: '60bdeef19886490fab191327ccae0b53',
    switchModel: 'ICX7150-C08P',
    untaggedPorts: '1/1/7'
  }],
  vlanId: 666,
  vlanName: 'vlan name'
}
