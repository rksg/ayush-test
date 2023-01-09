// export class PortSettingModel {

//   // TODO: complete whole model attributes
//   id: string;
//   port: string;
//   name: string;
//   portEnable: boolean;
//   poeEnable: boolean;
//   poeClass: string;
//   poePriority;
//   portProtected: boolean;

//   // @Matches(new RegExp('^([1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[12][0-9]{4}|30000)$'), {
//   //   message: 'Poe Budget can only be from 1000 - 30000',
//   // })
//   poeBudget: string;

//   constructor() {
//     this.id = '';
//     this.port = '';
//     this.poeClass = '';
//     this.poeBudget = '';
//     this.portProtected = false;
//   }
// }

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

  // @Matches(new RegExp('^([0-7])$'), {
  //   message: 'Enter a valid number between 0 and 7',
  // })
  priority?: number = 0

  // @IsNotEmpty({
  //   message: ValidationMessagesHelperService.getValidationMessage('required'),
  // })
  // @Matches(new RegExp('^([0-9]|[1-5][0-9]|6[0-3])$'), {
  //   message: 'Enter a valid number between 0 and 63',
  // })
  dscp: number = 0

}