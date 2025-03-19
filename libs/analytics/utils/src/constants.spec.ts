import { getWiredWirelessIncidentCodes, IncidentToggle, categoryOptions } from './constants'

describe('constants', () => {
  describe('categoryOptions', () => {
    it('returns true for isVisible', () => {
      expect(categoryOptions.map(({ isVisible }) => isVisible())).toEqual([
        true,
        true,
        true
      ])
    })
  })
  describe('productNames', () => {
    const mockGet = jest.fn()
    beforeEach(() => {
      jest.resetModules()
      jest.doMock('@acx-ui/config', () => ({ get: mockGet }))
    })
    it('returns values for R1', () => {
      mockGet.mockReturnValue(undefined)
      expect(require('.').productNames).toEqual({ smartZone: 'RUCKUS One' })
    })
    it('returns values for RA', () => {
      mockGet.mockReturnValue('true')
      expect(require('.').productNames).toEqual({ smartZone: 'SmartZone' })
    })
  })

  describe('incidentsToggle', () => {
    it('handle no toggles on', () => {
      const { incidentsToggle, incidentCodes } = require('.')
      expect(incidentsToggle({})).toEqual(incidentCodes)
    })
    it('handle toggles off', () => {
      const { incidentsToggle, incidentCodes } = require('.')
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: false
      }
      expect(incidentsToggle({ toggles })).toEqual(incidentCodes)
    })
    it('handle airtime incidents', () => {
      const { incidentsToggle, incidentCodes } = require('.')
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: true
      }
      expect(incidentsToggle({ toggles })).toEqual([
        ...incidentCodes,
        'p-airtime-b-24g-high',
        'p-airtime-b-5g-high',
        'p-airtime-b-6(5)g-high',
        'p-airtime-rx-24g-high',
        'p-airtime-rx-5g-high',
        'p-airtime-rx-6(5)g-high',
        'p-airtime-tx-24g-high',
        'p-airtime-tx-5g-high',
        'p-airtime-tx-6(5)g-high'
      ])
    })
    it('handle category specific toggles', () => {
      const { incidentsToggle, categoryCodeMap } = require('.')
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: true
      }
      expect(incidentsToggle({ toggles }, 'performance')).toEqual([
        ...categoryCodeMap.performance.codes,
        'p-airtime-b-24g-high',
        'p-airtime-b-5g-high',
        'p-airtime-b-6(5)g-high',
        'p-airtime-rx-24g-high',
        'p-airtime-rx-5g-high',
        'p-airtime-rx-6(5)g-high',
        'p-airtime-tx-24g-high',
        'p-airtime-tx-5g-high',
        'p-airtime-tx-6(5)g-high'
      ])
    })
    it('handle payload.code', () => {
      const { incidentsToggle, incidentCodes: code } = require('.')
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: true
      }
      expect(incidentsToggle({ code, toggles }, 'performance')).toEqual([
        ...code,
        'p-airtime-b-24g-high',
        'p-airtime-b-5g-high',
        'p-airtime-b-6(5)g-high',
        'p-airtime-rx-24g-high',
        'p-airtime-rx-5g-high',
        'p-airtime-rx-6(5)g-high',
        'p-airtime-tx-24g-high',
        'p-airtime-tx-5g-high',
        'p-airtime-tx-6(5)g-high'
      ])
    })
    it('handle incorrect category', () => {
      const { incidentsToggle, categoryCodeMap } = require('.')
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: true
      }
      const code = categoryCodeMap.performance.codes
      expect(incidentsToggle({ code, toggles }, 'infrastructure')).toEqual(code)
    })
    it('should return wired and wireless codes when no active toggles', () => {
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: false,
        [IncidentToggle.SwitchDDoSIncidents]: false,
        [IncidentToggle.SwitchLoopDetectionIncidents]: false,
        [IncidentToggle.SwitchLLDPStatusIncidents]: false,
        [IncidentToggle.SwitchPortCongestionIncidents]: false,
        [IncidentToggle.SwitchUplinkPortCongestionIncidents]: false
      }
      expect(getWiredWirelessIncidentCodes(toggles)).toEqual([
        [
          'p-switch-memory-high',
          'i-switch-vlan-mismatch',
          'i-switch-poe-pd'
        ],
        [
          'ttc',
          'radius-failure',
          'eap-failure',
          'dhcp-failure',
          'auth-failure',
          'assoc-failure',
          'p-cov-clientrssi-low',
          'p-load-sz-cpu-load',
          'p-channeldist-suboptimal-plan-24g',
          'p-channeldist-suboptimal-plan-50g-outdoor',
          'p-channeldist-suboptimal-plan-50g-indoor',
          'i-net-time-future',
          'i-net-time-past',
          'i-net-sz-net-latency',
          'i-apserv-high-num-reboots',
          'i-apserv-continuous-reboots',
          'i-apserv-downtime-high',
          'i-apinfra-poe-low',
          'i-apinfra-wanthroughput-low'
        ]
      ])
    })
    it('should return wired and wireless codes when active all switch related toggle', () => {
      const toggles = {
        [IncidentToggle.AirtimeIncidents]: false,
        [IncidentToggle.SwitchDDoSIncidents]: true,
        [IncidentToggle.SwitchLoopDetectionIncidents]: true,
        [IncidentToggle.SwitchLLDPStatusIncidents]: true,
        [IncidentToggle.SwitchPortCongestionIncidents]: true,
        [IncidentToggle.SwitchUplinkPortCongestionIncidents]: true
      }
      expect(getWiredWirelessIncidentCodes(toggles)).toEqual([
        [
          'p-switch-memory-high',
          'i-switch-vlan-mismatch',
          'i-switch-poe-pd',
          's-switch-tcp-syn-ddos',
          'i-switch-loop-detection',
          'i-switch-lldp-status',
          'p-switch-port-congestion',
          'p-switch-uplink-port-congestion'
        ],
        [
          'ttc',
          'radius-failure',
          'eap-failure',
          'dhcp-failure',
          'auth-failure',
          'assoc-failure',
          'p-cov-clientrssi-low',
          'p-load-sz-cpu-load',
          'p-channeldist-suboptimal-plan-24g',
          'p-channeldist-suboptimal-plan-50g-outdoor',
          'p-channeldist-suboptimal-plan-50g-indoor',
          'i-net-time-future',
          'i-net-time-past',
          'i-net-sz-net-latency',
          'i-apserv-high-num-reboots',
          'i-apserv-continuous-reboots',
          'i-apserv-downtime-high',
          'i-apinfra-poe-low',
          'i-apinfra-wanthroughput-low'
        ]
      ])
    })
  })
  describe('useRoles', () => {
    const useIsSplitOn = jest.fn()
    beforeEach(() => {
      jest.resetModules()
      jest.doMock('@acx-ui/feature-toggle', () => ({
        ...jest.requireActual('@acx-ui/feature-toggle'),
        useIsSplitOn
      }))
    })
    it('returns old roles', () => {
      useIsSplitOn.mockReturnValue(false)
      expect(Object.values(require('.').useRoles(false)).length).toEqual(3)
    })
    it('returns new roles', () => {
      useIsSplitOn.mockReturnValue(true)
      expect(Object.values(require('.').useRoles(false)).length).toEqual(7)
    })
    it('always returns new roles for places where splitio may not be initialized', () => {
      useIsSplitOn.mockReturnValue(false)
      expect(Object.values(require('.').useRoles()).length).toEqual(7)
    })
  })
})
