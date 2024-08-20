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
    const defaultTransitionIntentItem = {
      id: '1',
      displayStatus: displayStates.new,
      status: statuses.new

    }
    it('should handle displayStates.new', () => {
      expect(getTransitionStatus(
        Actions.One_Click_Optimize,
        {
          ...defaultTransitionIntentItem,
          displayStatus: displayStates.new
        }
      )).toEqual({ status: statuses.scheduled, statusReason: statusReasons.oneClick })
    })

    it('should handle (Actions.Optimize)', () => {
      expect(getTransitionStatus(
        Actions.Optimize,
        {
          ...defaultTransitionIntentItem,
          displayStatus: displayStates.new
        }
      )).toEqual({ status: statuses.scheduled })

      expect(getTransitionStatus(
        Actions.Optimize,
        {
          ...defaultTransitionIntentItem,
          status: statuses.applyScheduled,
          displayStatus: displayStates.applyScheduled
        }
      )).toEqual({ status: statuses.active })
    })

    it('should handle (Actions.Revert)', () => {
      expect(getTransitionStatus(
        Actions.Revert,
        {
          ...defaultTransitionIntentItem,
          status: statuses.active,
          displayStatus: displayStates.active
        }
      )).toEqual({ status: statuses.revertScheduled })
    })

    it('should handle (Actions.Pause)', () => {
      expect(getTransitionStatus(
        Actions.Pause,
        {
          ...defaultTransitionIntentItem,
          status: statuses.applyScheduled,
          displayStatus: displayStates.applyScheduled
        }
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromActive })

      expect(getTransitionStatus(
        Actions.Pause,
        {
          ...defaultTransitionIntentItem,
          status: statuses.na,
          displayStatus: displayStates.naWaitingForEtl
        }
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.fromInactive })
    })

    it('should handle (Actions.Cancel)', () => {
      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: statuses.scheduled,
          displayStatus: displayStates.scheduled
        }
      )).toEqual({ status: statuses.new })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: statuses.revertScheduled,
          displayStatus: displayStates.revertScheduled,
          metadata: {
            scheduledAt: '2024-07-19T04:01:00.000Z',
            applyScheduledAt: '2024-07-19T04:01:00.000Z'
          },
          statusTrail: [
            { status: statuses.revertScheduled },
            { status: statuses.applyScheduled }
          ]
        }
      )).toEqual({ status: statuses.active })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: statuses.revertScheduled,
          displayStatus: displayStates.revertScheduled,
          metadata: {
            scheduledAt: '2024-07-21T04:01:00.000Z',
            applyScheduledAt: '2024-07-21T04:01:00.000Z'
          },
          statusTrail: [
            { status: statuses.revertScheduled },
            { status: statuses.applyScheduled }
          ]
        }
      )).toEqual( { status: statuses.applyScheduled })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: statuses.revertScheduled,
          displayStatus: displayStates.revertScheduled,
          statusTrail: [
            { status: statuses.revertScheduled },
            { status: statuses.paused, statusReason: statusReasons.revertFailed }
          ]
        }
      )).toEqual({ status: statuses.paused, statusReason: statusReasons.revertFailed })

      expect(getTransitionStatus(
        Actions.Cancel,
        {
          ...defaultTransitionIntentItem,
          status: statuses.revertScheduled,
          displayStatus: displayStates.revertScheduled,
          statusTrail: [
            { status: statuses.revertScheduled },
            { status: statuses.active }
          ]
        }
      )).toEqual({ status: statuses.active })

      expect(() => {
        try{
          getTransitionStatus(
            Actions.Cancel,
            {
              ...defaultTransitionIntentItem,
              status: statuses.revertScheduled,
              displayStatus: displayStates.revertScheduled,
              statusTrail: []
            }
          )
        } catch (error) {
          throw error
        }
      }).toThrow('Invalid statusTrail(Cancel)')
    })

    describe('should handle (Actions.Resume)', () => {
      it('should handle pausedApplyFailed', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedApplyFailed,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.applyFailed },
              { status: statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: statuses.active }
        )
      })

      it('should handle pausedFromActive', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromActive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromActive },
              { status: statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-19T04:01:00.000Z',
              applyScheduledAt: '2024-07-19T04:01:00.000Z'
            }
          }
        )).toEqual(
          { status: statuses.applyScheduled }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromActive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromActive },
              { status: statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-21T04:01:00.000Z',
              applyScheduledAt: '2024-07-21T04:01:00.000Z'
            }
          }
        )).toEqual(
          { status: statuses.active }
        )
      })
      it('should handle pausedReverted', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedReverted,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.reverted },
              { status: statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: statuses.na, statusReason: statusReasons.waitingForEtl }
        )
      })

      it('should handle pausedRevertFailed', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedRevertFailed,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.revertFailed },
              { status: statuses.revertScheduled }
            ]
          }
        )).toEqual(
          { status: statuses.na, statusReason: statusReasons.waitingForEtl }
        )
      })

      it('should handle statusReasons.waitingForEtl', () => {
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromInactive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromInactive },
              { status: statuses.na, statusReason: statusReasons.waitingForEtl }
            ]
          }
        )).toEqual(
          { status: statuses.na, statusReason: statusReasons.waitingForEtl }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromInactive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromInactive },
              { status: statuses.na, statusReason: statusReasons.noAps }
            ]
          }
        )).toEqual(
          { status: statuses.na, statusReason: statusReasons.noAps }
        )
        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromInactive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromInactive },
              { status: statuses.na, statusReason: statusReasons.verified }
            ]
          }
        )).toEqual(
          { status: statuses.na, statusReason: statusReasons.verified }
        )

        expect(getTransitionStatus(
          Actions.Resume,
          {
            ...defaultTransitionIntentItem,
            status: statuses.paused,
            displayStatus: displayStates.pausedFromInactive,
            statusTrail: [
              { status: statuses.paused, statusReason: statusReasons.fromInactive },
              { status: statuses.new }
            ]
          }
        )).toEqual(
          { status: statuses.new }
        )
      })

      it('should handle Invalid statusTrail(Resume)', () => {
        expect(() => {
          try{
            getTransitionStatus(
              Actions.Resume,
              {
                ...defaultTransitionIntentItem,
                status: statuses.paused,
                displayStatus: displayStates.pausedFromInactive,
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

