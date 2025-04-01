import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { DateFormatEnum, formatter }                                        from '@acx-ui/formatter'
import { MspRbacUrlsInfo }                                                  from '@acx-ui/msp/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import MaxPeriod from './MaxPeriod'

const response = {
  message: '',
  data: {
    effectiveDate: '2024-10-21',
    expirationDate: '2025-10-21',
    quantity: 50,
    licenseType: 'APSW',
    isTrial: true
  }
}

describe('MaxPeriod Card', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json(response))
      ))
  })
  it.skip('should render Max Period Card with radio options', async () => {

    render(<Provider><MaxPeriod showExtendedTrial={true} /></Provider>)

    const radio = await screen.findAllByRole('radio')

    expect(radio).toHaveLength(2)

    const claculateBtn = await screen.findByRole('button', { name: 'CALCULATE' })

    userEvent.click(claculateBtn)

    expect(await screen.findByText('Please enter Start Date')).toBeVisible()
    expect(await screen.findByText('Please enter # of Licenses')).toBeVisible()

    await userEvent.click(screen.getByRole('textbox', { name: 'Start Date' }))

    const startDateCells = screen.getAllByRole('cell')

    await userEvent.click(startDateCells[startDateCells.length - 7])

    const input = screen.getByLabelText('# of Licenses')

    await fireEvent.change(input, { target: { value: '50' } })

    await userEvent.click(claculateBtn)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const date = formatter(DateFormatEnum.DateFormat)(response.data.expirationDate)

    await expect(await screen.findByText(date)).toBeVisible()
  })

  it('should render Max Period Card with no radio options', async () => {

    render(<Provider><MaxPeriod showExtendedTrial={false} /></Provider>)

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()

  })
})
