import { IncidentToggle } from './constants'

describe('constants', () => {
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
  })
})
