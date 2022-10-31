import { ApLanPorts }           from './ApLanPorts'
import { ApPosition }           from './ApPosition'
import { ApRadioCustomization } from './ApRadioCustomization'
import { ApStateEnum }          from './ApStateEnum'
import { ApSubStateEnum }       from './ApSubStateEnum'
import { BonjourGateway }       from './BonjourGateway'
import { DeviceGps }            from './DeviceGps'

export class ApDeep {
  serialNumber: string

  apGroupId?: string

  venueId: string

  lanPorts?: ApLanPorts

  bonjourGateway?: BonjourGateway

  radio: ApRadioCustomization

  // Number of currently connected clients. Available once AP has connected to Cloud.

  clientCount?: number

  // Last time AP contacted the Cloud. Available once AP has connected to Cloud.

  lastContacted: string

  // Last time AP received configuration from the Cloud. Available once AP has connected to Cloud.

  lastUpdated: string

  // (true) for indoor model. (false) for outdoor model. Available once AP has connected to Cloud.

  indoorModel?: boolean

  // Firmware version currently running on AP. Available once AP has connected to Cloud.

  firmware: string

  // One of (InSetupPhase), (Operational), (RequiresAttention), (TransientIssue).

  state: ApStateEnum

  // One of NeverContactedCloud, Initializing, Operational, ApplyingFirmware, ApplyingConfiguration, FirmwareUpdateFailed, ConfigurationUpdateFailed, DisconnectedFromCloud, Rebooting

  subState: ApSubStateEnum

  mac: string

  ip: string

  externalIp: string

  meshRole: string

  uptime_seconds?: number

  name: string

  description?: string

  tags?: string[]

  softDeleted?: boolean

  softDeletedDate?: Date

  model: string

  position?: ApPosition

  deviceGps?: DeviceGps

  updatedDate?: Date

  constructor () {
    this.serialNumber = ''

    this.venueId = ''

    this.lanPorts = new ApLanPorts()

    this.bonjourGateway = new BonjourGateway()

    this.radio = new ApRadioCustomization()

    this.lastContacted = ''

    this.lastUpdated = ''

    this.indoorModel = false

    this.firmware = ''

    this.state = '' as ApStateEnum

    this.subState = '' as ApSubStateEnum

    this.mac = ''

    this.ip = ''

    this.externalIp = ''

    this.meshRole = ''

    this.name = ''

    this.tags = []

    this.softDeleted = false

    this.model = ''

    this.position = new ApPosition()

    this.deviceGps = new DeviceGps()
  }
}
