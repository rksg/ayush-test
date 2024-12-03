import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspRbacUrlsInfo }            from '@acx-ui/msp/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import MaxLicenses from './MaxLicenses'

const response = {
  message: '',
  data: {
    effectiveDate: '2024-10-21',
    expirationDate: '2025-10-21',
    quantity: 50,
    licenseType: 'APSW',
    isTrial: false
  }
}

describe('MaxLicenses Card', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json(response))
      ))
  })
  it('should render Max Licenses Card with radio options', async () => {

    render(<Provider><MaxLicenses showExtendedTrial={true} /></Provider>)

    const radio = await screen.findAllByRole('radio')

    expect(radio).toHaveLength(2)

    const claculateBtn = await screen.findByRole('button', { name: 'CALCULATE' })

    userEvent.click(claculateBtn)

    expect(await screen.findByText('Please enter Start Date')).toBeVisible()
    expect(await screen.findByText('Please enter End Date')).toBeVisible()

    await userEvent.click(screen.getByRole('textbox', { name: 'Start Date' }))

    const startDateCells = screen.getAllByRole('cell')

    await userEvent.click(startDateCells[startDateCells.length - 10])

    await userEvent.click(screen.getByRole('textbox', { name: 'End Date' }))

    const endDateCells = screen.getAllByRole('cell')

    await userEvent.click(endDateCells[endDateCells.length - 7])

    await userEvent.click(document.body)

    await userEvent.click(claculateBtn)

    const licenseCountText = await screen.findByText((content) => {
      return content.includes('50') || content.includes('--')
    })

    expect(licenseCountText).toBeVisible()
  })

  it('should render Max Licenses Card with no radio options', async () => {

    render(<Provider><MaxLicenses showExtendedTrial={false} /></Provider>)

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()

  })
})
