import { omit } from 'lodash'

import {
  Dashboard,
  VenueDetailHeader
} from '@acx-ui/rc/utils'

import {
  getSwitchDonutChartData,
  getApDonutChartData,
  getVenueSwitchDonutChartData
} from './helper'

describe('getApDonutChartData', () => {
  const data = {
    summary: {
      aps: {
        summary: {
          '1_InSetupPhase': 5,
          '3_RequiresAttention': 3,
          '1_InSetupPhase_Offline': 3
        },
        totalCount: 1
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getApDonutChartData(data.summary.aps.summary)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase: 5, Offline: 3',
      value: 8
    }])

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.aps.summary.1_InSetupPhase')
    expect(getApDonutChartData(modifiedData.summary.aps.summary)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'Offline',
      value: 3
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getApDonutChartData(null as unknown as VenueDetailHeader['aps']['summary'])).toEqual([])
  })
})

describe('getSwitchDonutChartData', () => {
  const data = {
    summary: {
      switches: {
        summary: {
          PREPROVISIONED: '2',
          ONLINE: '1',
          INITIALIZING: '3'
        },
        totalCount: 3
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getSwitchDonutChartData(data)).toEqual([{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 5
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])

    // Removing PREPROVISIONED, and it should return INITIALIZING count
    const modifiedData = omit(data, 'summary.switches.summary.PREPROVISIONED')
    expect(getSwitchDonutChartData(modifiedData)).toEqual([{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 3
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getSwitchDonutChartData(null as unknown as Dashboard)).toEqual([])
  })
})

describe('getVenueSwitchDonutChartData', () => {
  const data = {
    switches: {
      summary: {
        PREPROVISIONED: 2,
        ONLINE: 1,
        INITIALIZING: 3
      }
    }
  } as VenueDetailHeader
  it('should return correct formatted data', async () => {
    expect(getVenueSwitchDonutChartData(data)).toEqual([{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 5
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])

    // Removing PREPROVISIONED, and it should return INITIALIZING count
    const modifiedData = omit(data, 'switches.summary.PREPROVISIONED')
    expect(getVenueSwitchDonutChartData(modifiedData)).toEqual([{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 3
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getVenueSwitchDonutChartData(null as unknown as VenueDetailHeader)).toEqual([])
  })
})
