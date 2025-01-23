import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { QuotaUsageBar } from './QuotaUsageBar'
describe('QuotaUsageBar', () => {
  it('should render correct 0%', async () => {
    const mockedOnClick = jest.fn()
    const total = 1024 * 1024 * 1024 * 50
    const used = 1024 * 1024 * 100
    render(<QuotaUsageBar total={total} used={used} onClick={mockedOnClick}/>)

    expect(await screen.findByText('49.9 GB of data remaining')).toBeVisible()
    expect(await screen.findByText('100 MB of 50 GB used (0%)')).toBeVisible()
  })
  it('should render correct 20%', async () => {
    const mockedOnClick = jest.fn()
    const total = 1024 * 1024 * 1024 * 50
    const used = 1024 * 1024* 1024 * 10
    render(<QuotaUsageBar total={total} used={used} onClick={mockedOnClick}/>)

    expect(await screen.findByText('40 GB of data remaining')).toBeVisible()
    expect(await screen.findByText('10 GB of 50 GB used (20%)')).toBeVisible()
    await userEvent.click(screen.getByTestId('sync-button'))
    expect(mockedOnClick).toBeCalled()
  })
})