import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }           from '@acx-ui/rc/services'
import { WifiUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  cleanup,
  findTBody,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { ApGroupTable } from '..'


const apGroupList = {
  data: [{
    id: '58195e050b8a4770acc320f6233ad8d9',
    name: 'apg1',
    venueId: '991eb992ece042a183b6945a2398ddb9',
    venueName: 'test-venue',
    members: { count: 1, names: ['T750SE'] },
    networks: { count: 4, names: ['joe-dpsk', 'joe-psk', 'joe-aaa', 'joe-open'] }
  }, {
    id: '58195e050b8a4770acc320f6233ad8d0',
    name: 'apg2',
    venueId: '991eb992ece042a183b6945a2398ddb9',
    venueName: 'test-venue'
  }, {
    id: '59080b16f1b9485aa84a48cd03d35d0d',
    members: { count: 1, names: ['R550_0601'] },
    name: 'apg3',
    networks: { count: 1, names: ['test-dpsk'] },
    venueId: '0e2f68ab79154ffea64aa52c5cc48826',
    venueName: 'My-Venue'
  }],
  page: 1,
  totalCount: 3
}

const expectedIncidents = {
  incidentCount0: { P1: 1, P2: 2, P3: 3, P4: 4 },
  incidentCount1: { P1: 4, P2: 3, P3: 2, P4: 1 },
  incidentCount2: { P1: 0, P2: 3, P3: 2, P4: 0 }
}


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const r1RaApiURL = '/api/a4rc/api/rsa-data-api/graphql/analytics'

describe('ApGroupTable', () => {

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json(apGroupList))
      ),
      rest.post(
        r1RaApiURL,
        (req, res, ctx) => res(ctx.json(expectedIncidents))
      )
    )
  })
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render correctly', async () => {
    render(<Provider><ApGroupTable /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
  })

  it.skip('Table action bar Delete', async () => {
    render(<Provider><ApGroupTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const deleteSpy = jest.fn()
    deleteSpy.mockReturnValueOnce(true)

    mockServer.use(
      rest.delete(
        WifiUrlsInfo.deleteApGroups.url,
        (req, res, ctx) => deleteSpy() && res(ctx.json({ requestId: '456' }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /apg1/i })
    await within(row1).findByRole('checkbox', { checked: false })

    await userEvent.click(row1)

    const toolbar = await screen.findByRole('alert')
    await userEvent.click(await within(toolbar).findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('button', { name: 'Delete AP Group' })).toBeVisible()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(row1) // unselect apGroup 1
    expect(await within(row1).findByRole('checkbox')).not.toBeChecked()

    const row2 = await screen.findByRole('row', { name: /apg2/i })
    await userEvent.click(row2)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    const dialogDeleteBtn = await within(dialog2).findByRole('button', { name: 'Delete AP Group' })
    expect(dialogDeleteBtn).toBeEnabled()

    await userEvent.click(await within(dialog2).findByRole('button', { name: 'Delete AP Group' }))

    expect(deleteSpy).toHaveBeenCalled()
    await waitFor(async () => expect(dialog2).not.toBeVisible())

  })

  it.skip('Table action bar Edit', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }

    render(<Provider><ApGroupTable
      rowSelection={{
        type: 'checkbox'
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const row = await screen.findByRole('row', { name: /apg1/i })
    await within(row).findByRole('checkbox', { checked: false })

    await userEvent.click(await screen.findByRole('row', { name: /apg1/i }))

    const toolbar = await screen.findByRole('alert')
    await userEvent.click(await within(toolbar).findByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('should render with filterables', async () => {
    const venueFilterOptions = [
      { key: '991eb992ece042a183b6945a2398ddb9' , value: 'test-venue' },
      { key: '0e2f68ab79154ffea64aa52c5cc48826' , value: 'My-Venue' }
    ]

    render(<Provider><ApGroupTable
      searchable={true}
      filterables={{
        venueId: venueFilterOptions
      }}
    /></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const row1 = await within(tbody).findByRole('row', { name: /apg1/i })
    expect(row1).toBeVisible()

    const combos = await screen.findAllByRole('combobox')
    expect(combos).toHaveLength(1)

    await userEvent.click(combos[0])
    const titles = await screen.findAllByTitle('My-Venue')
    await userEvent.click(titles[1])
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }), {
      timeout: 20000
    })

    const textInputs = await screen.findAllByRole('textbox')
    expect(textInputs).toHaveLength(1)
    await userEvent.type(textInputs[0], 'apg')

    const highlightString = await within(row1).findByText('apg')
    expect(highlightString).toBeVisible()

  }, 40000)
})
