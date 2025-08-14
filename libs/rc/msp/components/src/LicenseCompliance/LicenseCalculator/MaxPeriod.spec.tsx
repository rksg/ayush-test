import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }             from '@acx-ui/formatter'
import { MspRbacUrlsInfo }                       from '@acx-ui/msp/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import MaxPeriod from './MaxPeriod'

const v1Response = {
  message: '',
  data: {
    effectiveDate: '2024-10-21',
    expirationDate: '2025-10-21',
    quantity: 50,
    licenseType: 'APSW',
    isTrial: true
  }
}

const v2Response = {
  data: [
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Tue Apr 18 23:59:59 UTC 2028',
      quantity: 2,
      licenseType: 'APSW',
      skuTier: 'Silver',
      isTrial: false
    },
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Thu Jul 16 23:59:59 UTC 2026',
      quantity: 2,
      licenseType: 'APSW',
      skuTier: 'Platinum',
      isTrial: false
    }
  ]
}

describe('MaxPeriod Card', () => {
  it('should render Max Period Card with radio options', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE)
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json(v1Response))
      )
    )

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

    const date = await formatter(DateFormatEnum.DateFormat)(v1Response.data.expirationDate)

    await expect(await screen.findByText(date)).toBeVisible()
  })

  it('should render Empty Max Period Card', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE)

    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json({
          message: 'error-message',
          data: {
            effectiveDate: '2024-10-21',
            expirationDate: '2025-10-21',
            quantity: 50,
            licenseType: 'APSW',
            isTrial: true
          }
        }))
      )
    )

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

    await expect(await screen.findByText('error-message')).toBeVisible()
  })

  it('should render Max Period Card with radio options with FF on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE ||
      ff === Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json(v2Response))
      )
    )

    render(<Provider><MaxPeriod showExtendedTrial={true} /></Provider>)

    const radio = await screen.findAllByRole('radio')

    expect(radio).toHaveLength(3)

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

    const date = await formatter(DateFormatEnum.DateFormat)(v2Response.data[0].expirationDate)

    await expect(await screen.findByText(date)).toBeVisible()
  })

  it('should render Empty Max Period with FF on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE ||
      ff === Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )

    render(<Provider><MaxPeriod showExtendedTrial={true} /></Provider>)

    const radio = await screen.findAllByRole('radio')

    expect(radio).toHaveLength(3)

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

    await expect(await screen.findByText('--')).toBeVisible()
  })

  it('should render Max Period Card with no radio options', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.ENTITLEMENT_MULTI_LICENSE_POOL_TOGGLE)
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json(v1Response))
      )
    )

    render(<Provider><MaxPeriod showExtendedTrial={false} /></Provider>)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })
})
