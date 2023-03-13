import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { rest }            from 'msw'

import { PersonaUrls, PropertyUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockEnabledPropertyConfig, mockPersonaGroupWithoutNSG, mockPropertyUnitList } from '../../__tests__/fixtures'

import { VenuePropertyTab } from './index'

const tenantId = '15a04f095a8f4a96acaf17e921e8a6df'
const params = { tenantId, venueId: 'f892848466d047798430de7ac234e940' }

describe('Property Unit Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (_, res, ctx) => res(ctx.json(mockEnabledPropertyConfig))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupWithoutNSG))
      ),
      rest.delete(
        PropertyUrlsInfo.deletePropertyUnits.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        PropertyUrlsInfo.updatePropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        PropertyUrlsInfo.updatePropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('show render Unit table', async () => {
    render(<Provider><VenuePropertyTab /></Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Open add drawer
    const addUnitBtn = await screen.findByRole('button', { name: /add unit/i })
    await userEvent.click(addUnitBtn)

    const unitDialog = await screen.findByRole('dialog')
    await within(unitDialog).findByText(/add unit/i)
    await userEvent.click(await within(unitDialog).findByRole('button', { name: /cancel/i }))

    // select one of row and open edit drawer
    const firstRowName = mockPropertyUnitList.content[0].name
    const firstRow = await screen.findByRole('cell', { name: firstRowName })

    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /edit/i }))
  })

  it('should support Suspend, View Portal, Delete actions', async () => {
    render(<Provider><VenuePropertyTab /></Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Find first row
    const firstRowName = mockPropertyUnitList.content[0].name
    const firstRow = await screen.findByRole('cell', { name: firstRowName })

    // TODO: test while API ready and confirm with real behavior, and waitFor
    // 'Suspend' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /suspend/i }))
    // Wait api processing
    await waitFor(async () => await screen.findByRole('textbox'))

    // 'View Portal' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /view portal/i }))

    // 'Delete' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: /delete unit/i }))

    // Make sure clearSelection() be called
    await waitFor(async () => await screen.findByRole('textbox'))
  })
})
