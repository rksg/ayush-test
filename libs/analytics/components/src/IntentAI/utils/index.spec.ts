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
      )).toEqual({ status: statuses.scheduled })

      expect(getTransitionStatus(
        Actions.Optimize,
        displayStates.applyScheduled
      )).toEqual({ status: statuses.active })
    })

    it('should handle (Actions.Revert)', () => {
      expect(getTransitionStatus(
        Actions.Revert,
        displayStates.active
      )).toEqual({ status: statuses.revertScheduled })
    })

    it('should handle (Actions.Pause)', () => {
      expect(getTransitionStatus(
        Actions.Pause,
        displayStates.applyScheduled
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromActive })

      expect(getTransitionStatus(
        Actions.Pause,
        displayStates.naWaitingForEtl
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromInactive })
    })

    it('should handle (Actions.Cancel)', () => {
      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.scheduled
      )).toEqual({ status: statuses.new })

      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.revertScheduled,
        [
          { status: statuses.revertScheduled },
          { status: statuses.applyScheduled }
        ],
        { scheduledAt: '2024-07-19T04:01:00.000Z',
          applyScheduledAt: '2024-07-19T04:01:00.000Z'
        }
      )).toEqual({ status: statuses.active })

      expect(getTransitionStatus(
        Actions.Cancel,
        displayStates.revertScheduled,
        [
          { status: statuses.revertScheduled },
          { status: statuses.applyScheduled }
        ],
        { scheduledAt: '2024-07-21T04:01:00.000Z',
          applyScheduledAt: '2024-07-21T04:01:00.000Z'
        }
      )).toEqual( { status: statuses.applyScheduled })

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
      )).toEqual({ status: statuses.active })

      expect(() => {
        try{
          getTransitionStatus(
            Actions.Cancel,
            displayStates.revertScheduled,
            []
          )
        } catch (error) {
          throw error
        }
      }).toThrow('Invalid statusTrail(Cancel)')
    })

    it('should handle (Actions.Resume)', () => {
      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedApplyFailed,
        [
          { status: statuses.paused, statusReason: statusReasons.applyFailed },
          { status: statuses.revertScheduled }
        ]
      )).toEqual(
        { status: statuses.active }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedFromActive,
        [
          { status: statuses.paused, statusReason: statusReasons.fromActive },
          { status: statuses.applyScheduled }
        ],
        {
          scheduledAt: '2024-07-19T04:01:00.000Z',
          applyScheduledAt: '2024-07-19T04:01:00.000Z'
        }
      )).toEqual(
        { status: statuses.active }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedFromActive,
        [
          { status: statuses.paused, statusReason: statusReasons.fromActive },
          { status: statuses.applyScheduled }
        ],
        {
          scheduledAt: '2024-07-21T04:01:00.000Z',
          applyScheduledAt: '2024-07-21T04:01:00.000Z'
        }
      )).toEqual(
        { status: statuses.applyScheduled }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedReverted,
        [
          { status: statuses.paused, statusReason: statusReasons.reverted },
          { status: statuses.revertScheduled }
        ]
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.waitingForEtl }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedRevertFailed,
        [
          { status: statuses.paused, statusReason: statusReasons.revertFailed },
          { status: statuses.revertScheduled }
        ]
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.waitingForEtl }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedFromInactive,
        [
          { status: statuses.paused, statusReason: statusReasons.fromInactive },
          { status: statuses.na, statusReason: statusReasons.waitingForEtl }
        ]
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.waitingForEtl }
      )

      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedFromInactive,
        [
          { status: statuses.paused, statusReason: statusReasons.fromInactive },
          { status: statuses.na, statusReason: statusReasons.verified }
        ],
        {
          scheduledAt: '2024-07-21T04:01:00.000Z'
        },
        '2024-07-20T02:01:00.000Z'
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.waitingForEtl }
      )
      expect(getTransitionStatus(
        Actions.Resume,
        displayStates.pausedFromInactive,
        [
          { status: statuses.paused, statusReason: statusReasons.fromInactive },
          { status: statuses.na, statusReason: statusReasons.verified }
        ],
        {
          scheduledAt: '2024-07-21T04:01:00.000Z'
        },
        '2024-07-19T02:01:00.000Z'
      )).toEqual(
        { status: statuses.na, statusReason: statusReasons.verified }
      )

      expect(() => {
        try{
          getTransitionStatus(
            Actions.Resume,
            displayStates.pausedFromInactive,
            [],
            {
              scheduledAt: '2024-07-21T04:01:00.000Z'
            },
            '2024-07-19T02:01:00.000Z'
          )
        } catch (error) {
          throw error
        }
      }).toThrow('Invalid statusTrail(Resume)')

    })
  })
})

