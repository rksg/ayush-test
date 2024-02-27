import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Venue }                  from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { SelectVenuesDrawer } from './SelectVenuesDrawer'

const venueList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '81bcdd47ae0a49c2b2bab470ceb9e24d',
      name: 'new venue',
      country: 'United States'
    },
    {
      id: '0bac1d1f17644dd39090bee1b204a637',
      name: 'new venue 2',
      country: 'United States'
    },
    {
      id: '33292ac6f6ac4c75953da823b93d094f',
      name: 'test',
      country: 'Hong Kong'
    }
  ]
}
const selectedVenues =
[
  {
    id: '81bcdd47ae0a49c2b2bab470ceb9e24d',
    name: 'new venue',
    country: 'United States'
  },
  {
    id: '0bac1d1f17644dd39090bee1b204a637',
    name: 'new venue 2',
    country: 'United States'
  }
]

const services = require('@acx-ui/rc/services')

describe('SelectVenuesDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useVenuesListQuery = jest.fn().mockImplementation(() => {
      return { data: venueList }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <SelectVenuesDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Select Venues')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save Selection' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(venueList.data.length)

  })
  it('should load data correctly', async () => {
    render(
      <Provider>
        <SelectVenuesDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={selectedVenues as Venue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('new venue')).toBeVisible()
    expect(screen.getByText('new venue 2')).toBeVisible()
    expect(screen.getByText('2 selected')).toBeVisible()

  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <SelectVenuesDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()

    const input = screen.getByPlaceholderText('Search Name')
    await userEvent.type(input, 'new')
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(2)
    // expect(screen.getByText('p.eleu1658@rwbigdog.com')).toBeVisible()
  })
  it('should validate at least one venue selected', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectVenuesDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          selected={selectedVenues as Venue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(venueList.data.length + 1)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(checkboxes.at(2)!)

    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))

    expect(mockedCloseDialog).not.toHaveBeenCalledWith(false)
  })
  it('should handle save when no tenantId', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <SelectVenuesDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    // expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))

    expect(mockedSetSelected).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenCalledTimes(2)
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
