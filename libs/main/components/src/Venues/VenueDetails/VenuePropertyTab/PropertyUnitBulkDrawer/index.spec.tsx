import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import {  ConnectionMeteringUrls, PropertyUnit, PropertyUrlsInfo,PropertyUnitStatus } from '@acx-ui/rc/utils'
import { Provider }                                                                   from '@acx-ui/store'
import {  mockServer, render, screen,  waitFor }                                      from '@acx-ui/test-utils'
import { RolesEnum }                                                                  from '@acx-ui/types'
import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps
}         from '@acx-ui/user'

import {
  mockConnectionMeteringTableResult,
  replacePagination
} from '../../../__tests__/fixtures'

import { PropertyUnitBulkDrawer } from './index'




const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'has-nsg-venue-id',
  pinVenueId: 'has-nsg-venue-id',
  noPinVenueId: 'no-nsg-venue-id'
}

const current = moment(new Date('11/22/2023')).toISOString()
const data: PropertyUnit[] = [{
  id: 'unit-id-1',
  name: 'unit-1',
  status: PropertyUnitStatus.ENABLED,
  dpsks: [],
  personaId: 'persona-1',
  vni: 0,
  trafficControl: {
    meteringProfileId: mockConnectionMeteringTableResult.content[0].id,
    profileExpiry: current
  }
}, {
  id: 'unit-id-2',
  name: 'unit-2',
  status: PropertyUnitStatus.ENABLED,
  dpsks: [],
  personaId: 'persona-2',
  vni: 1,
  trafficControl: {
    meteringProfileId: mockConnectionMeteringTableResult.content[0].id,
    profileExpiry: current
  }
}]

const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  role: RolesEnum.ADMINISTRATOR,
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su'
} as UserProfileInterface


jest.mocked(useIsSplitOn).mockReturnValue(true)
const applyFn = jest.fn()
const closeFn = jest.fn()
describe.skip('Property Unit Bulk Drawer', () => {
  beforeEach(() => {
    closeFn.mockClear()
    applyFn.mockClear()
    mockServer.use(
      rest.patch(
        PropertyUrlsInfo.updatePropertyUnit.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        replacePagination(ConnectionMeteringUrls.getConnectionMeteringList.url),
        (_, res, ctx) => res(ctx.json(mockConnectionMeteringTableResult))
      ),
      rest.put(
        PropertyUrlsInfo.bulkUpdateUnitProfile.url,
        (_, res, ctx) => {
          applyFn()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render drawer correctly', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitBulkDrawer visible={true}
        onClose={closeFn}
        venueId={params.noPinVenueId}
        data={data}/>
    </Provider>)

    await screen.findByText('Edit Units')
    await screen.findByText('Selected Units')
    await screen.findByLabelText('Data Usage Metering')
    await screen.findByText('Data consumption')
    await screen.findByText('Expiration Date of Data Consumption')
    await screen.findByRole('button', { name: 'Apply' })
    await screen.findByRole('button', { name: 'Cancel' })
  })


  it('should cancel correctly', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitBulkDrawer visible={true}
        onClose={closeFn}
        venueId={params.noPinVenueId}
        data={data}/>
    </Provider>)

    const cancel = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancel)
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })


  it('should apply correctly', async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitBulkDrawer visible={true}
        onClose={closeFn}
        venueId={params.noPinVenueId}
        data={data}/>
    </Provider>)

    await screen.findByText('Edit Units')
    await screen.findByText('Selected Units')
    await screen.findByLabelText('Data Usage Metering')
    await screen.findByText('Data consumption')
    await screen.findByText('Expiration Date of Data Consumption')
    const apply = await screen.findByRole('button', { name: 'Apply' })
    await screen.findByRole('button', { name: 'Cancel' })

    await userEvent.click(apply)
    await waitFor(() => expect(applyFn).toHaveBeenCalled())
    await waitFor(() => expect(closeFn).toHaveBeenCalled())
  })

  it('should not render setting form', async () => {
    const data: PropertyUnit[] = [{
      id: 'unit-id-1',
      name: 'unit-1',
      status: PropertyUnitStatus.ENABLED,
      dpsks: [],
      personaId: 'persona-1',
      vni: 0,
      trafficControl: {
        meteringProfileId: mockConnectionMeteringTableResult.content[0].id,
        profileExpiry: current
      }
    }, {
      id: 'unit-id-2',
      name: 'unit-2',
      status: PropertyUnitStatus.ENABLED,
      dpsks: [],
      personaId: 'persona-2',
      vni: 1,
      trafficControl: {
        meteringProfileId: mockConnectionMeteringTableResult.content[1].id,
        profileExpiry: current
      }
    }]


    window.HTMLElement.prototype.scrollIntoView = function () {}
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      ></UserProfileContext.Provider>
      <PropertyUnitBulkDrawer visible={true}
        onClose={closeFn}
        venueId={params.noPinVenueId}
        data={data}/>
    </Provider>)

    await screen.findByText('Edit Units')
    await screen.findByText('Selected Units')

    expect(screen.queryByLabelText('Data Usage Metering')).not.toBeInTheDocument()
    expect(screen.queryByText('Data consumption')).not.toBeInTheDocument()
    expect(screen.queryByText('Expiration Date of Data Consumption')).not.toBeInTheDocument()
    await screen.findByRole('button', { name: 'Apply' })
    await screen.findByRole('button', { name: 'Cancel' })
  })
})
