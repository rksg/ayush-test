export class StickyClientSteering {
  enabled?: boolean
  snrThreshold?: number
  neighborApPercentageThreshold?: number
}

export class VenueStickyClientSteering extends StickyClientSteering {
}

export class ApStickyClientSteering extends StickyClientSteering {
  useVenueSettings?: boolean
}
