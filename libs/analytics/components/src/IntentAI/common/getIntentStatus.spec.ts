import { getIntentStatus } from './getIntentStatus'

describe('getIntentStatus', () => {
  it('returns correct status', () => {
    expect(getIntentStatus('new')).toEqual('New')
    expect(getIntentStatus('applyscheduled')).toEqual('Scheduled')
    expect(getIntentStatus('applyscheduleinprogress')).toEqual('Apply In Progress')
    expect(getIntentStatus('applied')).toEqual('Applied')
    expect(getIntentStatus('applyfailed')).toEqual('Failed')
    expect(getIntentStatus('beforeapplyinterrupted')).toEqual('Interrupted (Recommendation not applied)') // eslint-disable-line max-len
    expect(getIntentStatus('afterapplyinterrupted')).toEqual('Interrupted (Recommendation applied)')
    expect(getIntentStatus('applywarning')).toEqual('REVERT')
    expect(getIntentStatus('revertscheduled')).toEqual('Revert Scheduled')
    expect(getIntentStatus('revertscheduleinprogress')).toEqual('Revert In Progress')
    expect(getIntentStatus('revertfailed')).toEqual('Revert Failed')
    expect(getIntentStatus('reverted')).toEqual('Reverted')
    expect(getIntentStatus('deleted')).toEqual('Deleted')

    expect(getIntentStatus('xyz')).toEqual('Unknown')
  })
})
