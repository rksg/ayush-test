import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

import { displayStates, statuses, statusReasons } from '../states'

import {
  isDataRetained,
  getDefaultTime,
  getTransitionStatus,
  Actions
} from '.'

jest.mock('@acx-ui/config', () => ({ get: jest.fn() }))
jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2024-07-20T04:01:00.000Z').getTime()
)

describe('IntentAI utils', () => {
  describe('isDataRetained', () => {
    beforeEach(() => jest.mocked(get).mockReturnValue('380'))
    it('should return true', () => {
      expect(isDataRetained(moment().subtract(100, 'days').toISOString())).toBeTruthy()
    })
    it('should return false', () => {
      expect(isDataRetained(moment().subtract(400, 'days').toISOString())).toBeFalsy()
    })
    it('should handle undefined', () => {
      expect(isDataRetained(undefined)).toBeTruthy()
    })
  })

  it('should handle getDefaultTime', () => {
    expect(getDefaultTime().toISOString()).toBe('2024-07-21T03:00:00.000Z')
  })

  describe('getTransitionStatus', () => {
    it('should handle (Actions.One_Click_Optimize)', () => {
      expect(getTransitionStatus(
        Actions.One_Click_Optimize,
        displayStates.new
      )).toEqual({ status: statuses.scheduled, statusReason: statusReasons.oneClick })
    })

    it('should handle (Actions.Optimize)', () => {
      expect(getTransitionStatus(
        Actions.Optimize,
        displayStates.new
      )).toEqual({ status: statuses.scheduled, statusReason: null })

      expect(getTransitionStatus(
        Actions.Optimize,
        displayStates.applyScheduled
      )).toEqual({ status: statuses.active, statusReason: null })
    })

    it('should handle (Actions.Revert)', () => {
      expect(getTransitionStatus(
        Actions.Revert,
        displayStates.active
      )).toEqual({ status: statuses.revertScheduled, statusReason: null })
    })

    it('should handle (Actions.Stop)', () => {
      expect(getTransitionStatus(
        Actions.Stop,
        displayStates.applyScheduled
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromActive })

      expect(getTransitionStatus(
        Actions.Stop,
        displayStates.naWaitingForEtl
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromInactive })
    })

    it('should handle (Actions.Cancel)', () => {
      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.scheduled
      )).toEqual({ status: statuses.new, statusReason: null })

      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.revertScheduled,
        [
          { status: statuses.revertScheduled },
          { status: statuses.paused, statusReason: statusReasons.applyFailed }
        ]
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.applyFailed })

      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.revertScheduled,
        [
          { status: statuses.revertScheduled },
          { status: statuses.paused, statusReason: statusReasons.revertFailed }
        ]
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.revertFailed })

      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.revertScheduled,
        [
          { status: statuses.revertScheduled },
          { status: statuses.active }
        ]
      )).toEqual({ status: statuses.active, statusReason: null })
    })

    it('should handle (Actions.Resume)', () => {
      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedApplyFailed
      )).toEqual(
        { status: statuses.active, statusReason: null }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedReverted
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.waitingForEtl }
      )
    })
  })
})

