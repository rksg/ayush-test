import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

import { DisplayStates, Statuses, StatusReasons } from '../states'

import {
  getDefaultTime,
  getTransitionStatus,
  Actions,
  isDataRetained
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
    const defaultTransitionIntentItem = {
      id: '1',
      displayStatus: DisplayStates.new,
      status: Statuses.new

    }
    it('should handle DisplayStates.new', () => {
      expect(getTransitionStatus(
        Actions.One_Click_Optimize,
        {
          ...defaultTransitionIntentItem,
          displayStatus: DisplayStates.new
        }
      )).toEqual({ status: Statuses.scheduled, statusReason: StatusReasons.oneClick })
    })

    it('should handle (Actions.Optimize)', () => {
      expect(getTransitionStatus(
        Actions.Optimize,
        {
          ...defaultTransitionIntentItem,
          displayStatus: DisplayStates.new
        }
      )).toEqual({ status: Statuses.scheduled })

      expect(getTransitionStatus(
        Actions.Optimize,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.applyScheduled,
          displayStatus: DisplayStates.applyScheduled
        }
      )).toEqual({ status: Statuses.active })
    })

    it('should handle (Actions.Revert)', () => {
      expect(getTransitionStatus(
        Actions.Revert,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.active,
          displayStatus: DisplayStates.active
        }
      )).toEqual({ status: Statuses.revertScheduled })
    })

    it('should handle (Actions.Pause)', () => {
      expect(getTransitionStatus(
        Actions.Pause,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.applyScheduled,
          displayStatus: DisplayStates.applyScheduled
        }
      )).toEqual({ status: Statuses.paused, statusReason: StatusReasons.fromActive })

      expect(getTransitionStatus(
        Actions.Pause,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.na,
          displayStatus: DisplayStates.naWaitingForEtl
        }
      )).toEqual({ status: Statuses.paused, statusReason: StatusReasons.fromInactive })
    })

    it('should handle (Actions.Cancel)', () => {
      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.scheduled,
          displayStatus: DisplayStates.scheduled
        }
      )).toEqual({ status: Statuses.new })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.revertScheduled,
          displayStatus: DisplayStates.revertScheduled,
          metadata: {
            scheduledAt: '2024-07-19T04:01:00.000Z',
            applyScheduledAt: '2024-07-19T04:01:00.000Z'
          },
          statusTrail: [
            { status: Statuses.revertScheduled },
            { status: Statuses.applyScheduled }
          ]
        }
      )).toEqual({ status: Statuses.active })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.revertScheduled,
          displayStatus: DisplayStates.revertScheduled,
          metadata: {
            scheduledAt: '2024-07-21T04:01:00.000Z',
            applyScheduledAt: '2024-07-21T04:01:00.000Z'
          },
          statusTrail: [
            { status: Statuses.revertScheduled },
            { status: Statuses.applyScheduled }
          ]
        }
      )).toEqual( { status: Statuses.applyScheduled })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.revertScheduled,
          displayStatus: DisplayStates.revertScheduled,
          statusTrail: [
            { status: Statuses.revertScheduled },
            { status: Statuses.paused, statusReason: StatusReasons.revertFailed }
          ]
        }
      )).toEqual({ status: Statuses.paused, statusReason: StatusReasons.revertFailed })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: Statuses.revertScheduled,
          displayStatus: DisplayStates.revertScheduled,
          statusTrail: [
            { status: Statuses.revertScheduled },
            { status: Statuses.active }
          ]
        }
      )).toEqual({ status: Statuses.active })

      expect(() => {
        try{
          getTransitionStatus(
            Actions.Cancel,
            {
              ...defaultTransitionIntentItem,
              status: Statuses.revertScheduled,
              displayStatus: DisplayStates.revertScheduled,
              statusTrail: []
            }
          )
        } catch (error) {
          throw error
        }
      }).toThrow('Invalid statusTrail(Cancel)')
    })

    describe('should handle (Actions.Resume)', () => {
      it('should handle scheduled', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.scheduled }
            ]
          }
        )).toEqual(
          { status: Statuses.new }
        )
      })
      it('should handle pausedApplyFailed', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedApplyFailed,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.applyFailed },
              { status: Statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: Statuses.active }
        )
      })

      it('should handle pausedFromActive', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromActive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromActive },
              { status: Statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-19T04:01:00.000Z',
              applyScheduledAt: '2024-07-19T04:01:00.000Z'
            }
          }
        )).toEqual(
          { status: Statuses.applyScheduled }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromActive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromActive },
              { status: Statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-21T04:01:00.000Z',
              applyScheduledAt: '2024-07-21T04:01:00.000Z'
            }
          }
        )).toEqual(
          { status: Statuses.active }
        )
      })
      it('should handle pausedReverted', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedReverted,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.reverted },
              { status: Statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
        )
      })

      it('should handle pausedRevertFailed', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedRevertFailed,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.revertFailed },
              { status: Statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
        )
      })

      it('should handle StatusReasons.waitingForEtl', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
            ]
          }
        )).toEqual(
          { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.noAps }
            ]
          }
        )).toEqual(
          { status: Statuses.na, statusReason: StatusReasons.noAps }
        )
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.verified }
            ]
          }
        )).toEqual(
          { status: Statuses.na, statusReason: StatusReasons.verified }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.new }
            ]
          }
        )).toEqual(
          { status: Statuses.new }
        )
      })

      it('should handle Invalid statusTrail(Resume)', () => {
        expect(() => {
          try{
            getTransitionStatus(
              Actions.Resume,
              {
                ...defaultTransitionIntentItem,
                status: Statuses.paused,
                displayStatus: DisplayStates.pausedFromInactive,
                statusTrail: [],
                metadata: {
                  scheduledAt: '2024-07-21T04:01:00.000Z'
                }
              }
            )
          } catch (error) {
            throw error
          }
        }).toThrow('Invalid statusTrail(Resume)')
      })
    })
  })
})
