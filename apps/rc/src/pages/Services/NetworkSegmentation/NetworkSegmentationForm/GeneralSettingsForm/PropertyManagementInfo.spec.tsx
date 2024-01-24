
import { rest } from 'msw'

import { StepsForm }                               from '@acx-ui/components'
import { DpskUrls, PersonaUrls, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, screen }              from '@acx-ui/test-utils'

import { mockDpsk, mockPersonaGroup, mockPropertyConfigs } from '../../__tests__/fixtures'

import { PropertyManagementInfo } from './PropertyManagementInfo'

jest.mock('./PropertyManagementModal', () => ({
  PropertyManagementModal: () => <div data-testid='PropertyManagementModal' />
}))

describe('NSG GeneralSettings Form - PropertyManagementInfo', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockPropertyConfigs))
      )
    )
  })

  it('Should show property config info successfully', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <PropertyManagementInfo venueId='venue-id' />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByTestId('PropertyManagementModal')).toBeVisible()
    expect(await screen.findByRole('link', { name: mockPersonaGroup.name })).toBeVisible()
    expect(await screen.findByRole('link', { name: mockDpsk.name })).toBeVisible()
  })
})

describe('NSG GeneralSettings Form - PropertyManagementInfo (property management disabled)', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.status(404))
      )
    )
  })

  it('Should show show warning message when property management is disabled', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <PropertyManagementInfo venueId='venue-id' />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params }
      }
    )

    expect(
      await screen.findByRole('button', { name: 'Venue\'s property configuration page' })
    ).toBeVisible()
  })
})
