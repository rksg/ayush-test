export class ClientAdmissionControl {
  enable24G?: boolean
  enable50G?: boolean
  minClientCount24G?: number
  minClientCount50G?: number
  maxRadioLoad24G?: number
  maxRadioLoad50G?: number
  minClientThroughput24G?: number
  minClientThroughput50G?: number

  constructor () {
    this.enable24G = false
    this.enable50G = false
  }
}

export class VenueClientAdmissionControl extends ClientAdmissionControl {
}

export class ApClientAdmissionControl_v1_1 extends ClientAdmissionControl {
  useVenueOrApGroupSettings?: boolean
}

export class ApClientAdmissionControl extends ClientAdmissionControl {
  useVenueSettings?: boolean
}

export class ApGroupClientAdmissionControl extends ClientAdmissionControl {
  useVenueSettings?: boolean
}
