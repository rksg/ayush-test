

import { StepsForm }       from '@acx-ui/components'
import { EdgeNSGFixtures } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'

import { mockContextData }                    from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { PropertyManagementInfo } from './PropertyManagementInfo'

jest.mock('./PropertyManagementModal', () => ({
  PropertyManagementModal: () => <div data-testid='PropertyManagementModal' />
}))

const { mockPersonaGroup, mockDpsk } = EdgeNSGFixtures

describe('PIN GeneralSettings Form - PropertyManagementInfo', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
  })

  it('Should show property config info successfully', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <PropertyManagementInfo venueId='venue-id' />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByTestId('PropertyManagementModal')).toBeVisible()
    expect(await screen.findByRole('link', { name: mockPersonaGroup.name })).toBeVisible()
    expect(await screen.findByRole('link', { name: mockDpsk.name })).toBeVisible()
  })
})

describe('PIN GeneralSettings Form - PropertyManagementInfo (property management disabled)', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
  })

  it('Should show show warning message when property management is disabled', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={{
            ...mockContextData,
            isGetPropertyConfigError: true
          }}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <PropertyManagementInfo venueId='venue-id' />
            </StepsForm.StepForm>
          </StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(
      await screen.findByRole('button', { name: 'property configuration page' })
    ).toBeVisible()
  })
})
