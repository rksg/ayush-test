import { getAPStatusDisplayName, getEdgeStatusDisplayName, getSwitchStatusDisplayName } from './getStatusDisplayName'
import { EdgeStatusSeverityEnum }                                                       from './models/EdgeEnum'
import { ApVenueStatusEnum, SwitchStatusEnum }                                          from './types'


describe('getStatusDisplayName', () => {
  it('should test getSwitchStatusDisplayName method', () => {
    const listOfStatuses:SwitchStatusEnum[] = [
      SwitchStatusEnum.INITIALIZING,
      SwitchStatusEnum.DISCONNECTED,
      SwitchStatusEnum.OPERATIONAL,
      SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
      SwitchStatusEnum.APPLYING_FIRMWARE
    ]
    const output = listOfStatuses.map(status=>getSwitchStatusDisplayName(status))
    expect(output).toEqual([
      'In Setup Phase',
      'Alerting',
      'Operational',
      'In Setup Phase',
      'Requires Attention'
    ])
  })

  it('should test getAPStatusDisplayName method', () => {
    const listOfStatuses:ApVenueStatusEnum[] = [
      ApVenueStatusEnum.IN_SETUP_PHASE,
      ApVenueStatusEnum.OFFLINE,
      ApVenueStatusEnum.OPERATIONAL,
      ApVenueStatusEnum.REQUIRES_ATTENTION,
      ApVenueStatusEnum.TRANSIENT_ISSUE
    ]
    let output = listOfStatuses.map(status=>getAPStatusDisplayName(status))
    expect(output).toEqual([
      '3 In Setup Phase',
      '3 Offline',
      '4 Operational',
      '1 Requires Attention',
      '2 Transient Issue'
    ])

    // Return only Names without severity
    output = listOfStatuses.map(status=>getAPStatusDisplayName(status, false))
    expect(output).toEqual([
      'In Setup Phase',
      'Offline',
      'Operational',
      'Requires Attention',
      'Transient Issue'
    ])

  })

  it('should test getEdgeStatusDisplayName method', () => {
    const listOfStatuses:EdgeStatusSeverityEnum[] = [
      EdgeStatusSeverityEnum.IN_SETUP_PHASE,
      EdgeStatusSeverityEnum.OFFLINE,
      EdgeStatusSeverityEnum.OPERATIONAL,
      EdgeStatusSeverityEnum.REQUIRES_ATTENTION,
      EdgeStatusSeverityEnum.TRANSIENT_ISSUE
    ]
    let output = listOfStatuses.map(status=>getEdgeStatusDisplayName(status))
    expect(output).toEqual([
      '3 In Setup Phase',
      '3 Offline',
      '4 Operational',
      '1 Requires Attention',
      '2 Transient Issue'
    ])

    // Return only Names without severity
    output = listOfStatuses.map(status=>getEdgeStatusDisplayName(status, false))
    expect(output).toEqual([
      'In Setup Phase',
      'Offline',
      'Operational',
      'Requires Attention',
      'Transient Issue'
    ])

  })
})
