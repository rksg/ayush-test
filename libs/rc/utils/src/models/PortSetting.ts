export class PortSettingModel {
  dhcpSnoopingTrust: boolean
  id: string
  ipsg: boolean
  lldpEnable: boolean
  lldpQos: LldpQosModel[]
  poeCapability: boolean
  poeClass: string
  poeEnable: boolean
  poePriority: number
  port: string
  poeBudget?: number
  portEnable: boolean
  portProtected: boolean
  portSpeed: string
  revert: boolean
  rstpAdminEdgePort: boolean
  stpBpduGuard: boolean
  stpRootGuard: boolean
  switchId: string
  switchMac: string
  taggedVlans?: string[]
  untaggedVlan?: Number | string
  voiceVlan: number | string
  egressAcl?: string
  ingressAcl?: string
  switchSerialNumber: string
  status?: string // ignore

  constructor () {
    this.dhcpSnoopingTrust = false
    this.id = ''
    this.ipsg = false
    this.lldpEnable = false
    this.lldpQos = []
    this.poeCapability = false
    this.poeClass = ''
    this.poeEnable = false
    this.poePriority = 0
    this.port = ''
    this.poeBudget = 0
    this.portEnable = false
    this.portProtected = false
    this.portSpeed = ''
    this.revert = false
    this.rstpAdminEdgePort = false
    this.stpBpduGuard = false
    this.stpRootGuard = false
    this.switchId = ''
    this.switchMac = ''
    this.taggedVlans = []
    this.untaggedVlan = ''
    this.voiceVlan = ''
    this.egressAcl = ''
    this.ingressAcl = ''
    this.switchSerialNumber = ''
  }
}

export enum QOS_APP_Type {
  'Guest-voice' = 'GUEST_VOICE',
  'Guest-voice-signaling' = 'GUEST_VOICE_SIGNALING',
  'Softphone-voice' = 'SOFTPHONE_VOICE',
  'Streaming-video' = 'STREAMING_VIDEO',
  'Video-conferencing' = 'VIDEO_CONFERENCING',
  'Video-signaling' = 'VIDEO_SIGNALING',
  'Voice' = 'VOICE',
  'Voice-signaling' = 'VOICE_SIGNALING',
}

export enum QOS_VLAN_Type {
  'Priority-tagged' = 'PRIORITY_TAGGED',
  'Tagged' = 'TAGGED',
  'Untagged' = 'UNTAGGED',
}

export class LldpQosModel {
  id: string = ''
  applicationType: QOS_APP_Type = QOS_APP_Type['Guest-voice']
  qosVlanType: QOS_VLAN_Type = QOS_VLAN_Type['Priority-tagged']
  vlanId?: number = 0
  priority?: number = 0
  dscp: number = 0
}