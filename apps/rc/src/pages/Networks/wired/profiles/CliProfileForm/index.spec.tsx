import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor
} from '@acx-ui/test-utils'

import {
  cliProfile,
  configExamples,
  familyModels,
  profiles,
  venues
} from './__tests__/fixtures'

import CliProfileForm from './'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})

window.focus = jest.fn()
document.elementFromPoint = jest.fn()
document.createRange = () => {
  const range = new Range()
  range.getBoundingClientRect = jest.fn()
  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn()
    }
  }
  return range
}

describe('Cli Profile Form - Add', () => {
  const params = {
    tenantId: 'tenant-id', configType: 'profiles'
  }
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: profiles }))
      ),
      rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
        (_, res, ctx) => res(ctx.json(configExamples))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  it('should render correctly', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/add' }
    })

    expect(await screen.findByText('Add CLI Configuration Profile')).toBeVisible()
    expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
    await userEvent.type(
      await screen.findByLabelText(/Please type “AGREE” here to continue/), 'agree'
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Models' })
    await screen.findByText('Select switch models')
    fireEvent.change(
      await screen.findByLabelText(/Profile Name/), { target: { value: 'test cli' } }
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
    await screen.findByText('CLI commands')
    const addExampleBtns = await screen.findAllByTestId('add-example-btn')
    await userEvent.click(addExampleBtns[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    const row1 = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(await within(row1).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  }, 30000)

  it('should render breadcrumb correctly', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/add' }
    })

    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Wired Network Profiles')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /configuration profiles/i
    })).toBeTruthy()
  })

  it('should handle models changed', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/add' }
    })

    expect(await screen.findByText('Add CLI Configuration Profile')).toBeVisible()
    await userEvent.type(
      await screen.findByLabelText(/Please type “AGREE” here to continue/), 'agree'
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Models' })
    await screen.findByText('Select switch models')
    fireEvent.change(
      await screen.findByLabelText(/Profile Name/), { target: { value: 'test cli' } }
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
    await screen.findByText('26 Models selected')
    await userEvent.click(await screen.findByRole('button', { name: 'Deselect All' }))
    await screen.findByText('0 Models selected')
  })

  it('should handle family models changed', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/add' }
    })

    expect(await screen.findByText('Add CLI Configuration Profile')).toBeVisible()
    await userEvent.type(
      await screen.findByLabelText(/Please type “AGREE” here to continue/), 'agree'
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Models' })
    await screen.findByText('Select switch models')
    fireEvent.change(
      await screen.findByLabelText(/Profile Name/), { target: { value: 'test cli' } }
    )
    const options = await screen.findAllByRole('checkbox')

    expect(options).toHaveLength(30) // family model group 4 + model 26
    await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
    await screen.findByText('26 Models selected')
    await userEvent.click(options[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Deselect All' }))
    await screen.findByText('11 Models selected')
  })

  it('should handle error occurred', async () => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.status(400), ctx.json({ errors: [{ code: 'xxxx' }] })))
    )

    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/add' }
    })

    expect(await screen.findByText('Add CLI Configuration Profile')).toBeVisible()
    await userEvent.type(
      await screen.findByLabelText(/Please type “AGREE” here to continue/), 'agree'
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Models' })
    await screen.findByText('Select switch models')
    fireEvent.change(
      await screen.findByLabelText(/Profile Name/), { target: { value: 'test cli' } }
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
    await screen.findByText('CLI commands')
    const addExampleBtns = await screen.findAllByTestId('add-example-btn')
    await userEvent.click(addExampleBtns[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // TODO
    // await screen.findByText('Server Error')
  }, 30000)
})


describe('Cli Profile Form - Edit', () => {
  const params = {
    tenantId: 'tenant-id',
    action: 'edit',
    configType: 'profiles',
    profileId: '4515bc6524544cc79303cc6a6443f6c4'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: profiles }))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(cliProfile))
      ),
      rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
        (_, res, ctx) => res(ctx.json(configExamples))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })
  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render correctly', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
    expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should handle error occurred', async () => {
    mockServer.use(
      rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({ errors: [{ code: 'xxxx' }] }))
      )
    )
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    // await screen.findByText('Server Error')
  })

  it('should redirect to list table after clicking cancel button', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
    })
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})
