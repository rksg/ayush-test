import { omit } from 'lodash'

import {
  Dashboard,
  EdgeStatusSeverityStatistic,
  VenueDetailHeader
} from '@acx-ui/rc/utils'

import {
  getSwitchDonutChartData,
  getApDonutChartData,
  getVenueSwitchDonutChartData,
  getEdgeDonutChartData,
  getSwitchStackedBarChartData,
  getApStackedBarChartData,
  getEdgeStackedBarChartData
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

describe('getApStackedBarChartData', () => {
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
    expect(getApStackedBarChartData(data.summary.aps.summary)).toMatchSnapshot()

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.aps.summary.1_InSetupPhase')
    expect(getApStackedBarChartData(modifiedData.summary.aps.summary))
      .toMatchSnapshot('omit-InSetupPhase')
  })
  it('should return empty array if no data', ()=>{
    expect(getApStackedBarChartData(null as unknown as
       VenueDetailHeader['aps']['summary'])).toMatchSnapshot()
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

describe('getSwitchStackedBarChartData', () => {
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
    expect(getSwitchStackedBarChartData(data)).toMatchSnapshot()

    // Removing PREPROVISIONED, and it should return INITIALIZING count
    const modifiedData = omit(data, 'summary.switches.summary.PREPROVISIONED')
    expect(getSwitchStackedBarChartData(modifiedData)).toMatchSnapshot()
  })
  it('should return empty array if no data', ()=>{
    expect(getSwitchStackedBarChartData(null as unknown as Dashboard)).toMatchSnapshot()
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

describe('getEdgeDonutChartData', () => {
  const data = {
    summary: {
      '1_InSetupPhase': 5,
      '3_RequiresAttention': 3,
      '1_InSetupPhase_Offline': 3
    },
    totalCount: 1
  }
  it('should return correct formatted data', async () => {
    expect(getEdgeDonutChartData(data)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase: 5, Offline: 3',
      value: 8
    }])

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.1_InSetupPhase')
    expect(getEdgeDonutChartData(modifiedData)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'Offline',
      value: 3
    }])

    //Removing 1_InSetupPhase_Offline count
    const dataWithoutOffline = omit(data, 'summary.1_InSetupPhase_Offline')
    expect(getEdgeDonutChartData(dataWithoutOffline)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 5
    }])
  })

  it('should return correct formatted data when not to show offline', async () => {
    expect(getEdgeDonutChartData(data, false)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 8
    }])

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.1_InSetupPhase')
    expect(getEdgeDonutChartData(modifiedData, false)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 3
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getEdgeDonutChartData(null as unknown as EdgeStatusSeverityStatistic)).toEqual([])
  })
})

describe('getEdgeStackedBarChartData', () => {
  const data = {
    summary: {
      edges: {
        summary: {
          '1_InSetupPhase': 6,
          '3_RequiresAttention': 2,
          '1_InSetupPhase_Offline': 1
        },
        totalCount: 9
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getEdgeStackedBarChartData(data.summary.edges)).toMatchSnapshot()

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.edges.summary.1_InSetupPhase')
    expect(getEdgeStackedBarChartData(modifiedData.summary.edges))
      .toMatchSnapshot('omit-InSetupPhase')
  })
  it('should return empty array if no data', ()=>{
    expect(getEdgeStackedBarChartData(null as unknown as
       VenueDetailHeader['edges'])).toMatchSnapshot()
  })
})
