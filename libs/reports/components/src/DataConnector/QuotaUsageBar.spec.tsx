import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { notificationApi, notificationApiURL, Provider, store } from '@acx-ui/store'
import { mockServer, render, screen }                           from '@acx-ui/test-utils'

import { mockedDataQuotaUsage } from './__tests__/fixtures'
import { QuotaUsageBar }        from './QuotaUsageBar'

describe('QuotaUsageBar', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${notificationApiURL}/dataConnector/quota`,
        (_, res, ctx) => res(ctx.json(mockedDataQuotaUsage))
      )
    )
  })
  afterEach(() => {
    store.dispatch(notificationApi.util.resetApiState())
  })
  it('should render correct 0%', async () => {
    const mockedOnClick = jest.fn()
    render(<Provider><QuotaUsageBar onClick={mockedOnClick}/></Provider>)

    expect(await screen.findByText('49.9 GB of data remaining')).toBeVisible()
    expect(await screen.findByText('100 MB of 50 GB used (0%)')).toBeVisible()
  })
  it('should render correct 100% threshold exceeded', async () => {
    const mockedOnClick = jest.fn()
    mockServer.use(
      rest.get(
        `${notificationApiURL}/dataConnector/quota`,
        (_, res, ctx) => res(ctx.json({
          ...mockedDataQuotaUsage,
          used: (10737418240 * 5.1) // 1024 * 1024* 1024 * 10 * 5.1
        }))
      )
    )
    render(<Provider><QuotaUsageBar onClick={mockedOnClick}/></Provider>)

    expect(await screen.findByText('0 B of data remaining')).toBeVisible()
    expect(await screen.findByText('51 GB of 50 GB used (100% threshold exceeded)')).toBeVisible()
    await userEvent.click(screen.getByTestId('sync-button'))
    expect(mockedOnClick).toBeCalled()
  })
  it('should render correct 20% ', async () => {
    const mockedOnClick = jest.fn()
    mockServer.use(
      rest.get(
        `${notificationApiURL}/dataConnector/quota`,
        (_, res, ctx) => res(ctx.json({
          ...mockedDataQuotaUsage,
          used: 10737418240 // 1024 * 1024* 1024 * 10
        }))
      )
    )
    render(<Provider><QuotaUsageBar onClick={mockedOnClick}/></Provider>)

    expect(await screen.findByText('40 GB of data remaining')).toBeVisible()
    expect(await screen.findByText('10 GB of 50 GB used (20%)')).toBeVisible()
    await userEvent.click(screen.getByTestId('sync-button'))
    expect(mockedOnClick).toBeCalled()
  })
})