import { cancelMiddleware, pendingQueries } from './cancelMiddleware'

describe('cancelMiddleware', () => {
  beforeEach(() => {
    pendingQueries.clear()
  })
  it('aborts and dispatches removeQueryResult on unsubscribeQueryResult pending', () => {
    const action = {
      type: 'api1/subscriptions/unsubscribeQueryResult',
      meta: { requestStatus: 'pending', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({
      api1: {
        queries: {
          key1: {
            status: 'pending'
          }
        }
      }
    })
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    pendingQueries.set('key1', abort)
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      type: 'api1/queries/removeQueryResult',
      payload: {
        queryCacheKey: 'key1'
      }
    })
  })
  it('does not abort requests which are not tracked', () => {
    const action = {
      type: 'api1/subscriptions/unsubscribeQueryResult',
      meta: { requestStatus: 'pending', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({
      api1: {
        queries: {
          key1: {
            status: 'pending'
          }
        }
      }
    })
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('does not abort requests which are not pending', () => {
    const action = {
      type: 'api1/subscriptions/unsubscribeQueryResult',
      meta: { requestStatus: 'pending', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({
      api1: {
        queries: {
          key1: {
            status: ''
          }
        }
      }
    })
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    pendingQueries.set('key1', abort)
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })
  it('does not clear pending requests', () => {
    const action = {
      type: 'api1/executeQuery/fulfilled',
      meta: { requestStatus: 'pending', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({})
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    pendingQueries.set('key1', abort)
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(pendingQueries.get('key1')).not.toBeUndefined()
  })
  it('clears requests after they are done', () => {
    const action = {
      type: 'api1/executeQuery/fulfilled',
      meta: { requestStatus: 'fulfilled', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({})
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    pendingQueries.set('key1', abort)
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(pendingQueries.get('key1')).toBeUndefined()
  })
  it('ignores non request action', () => {
    const action = {
      type: 'someAction',
      meta: { requestStatus: 'fulfilled', arg: { queryCacheKey: 'key1' } },
      payload: { queryCacheKey: 'key1' }
    }
    const getState = () => ({})
    const dispatch = jest.fn()
    const next = jest.fn()
    const abort = jest.fn()
    cancelMiddleware({ getState, dispatch })(next)(action)
    expect(next).toHaveBeenCalled()
    expect(abort).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
