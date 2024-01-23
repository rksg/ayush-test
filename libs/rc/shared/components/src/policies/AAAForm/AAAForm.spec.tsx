import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AaaUrls, ConfigTemplateUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                           from '@acx-ui/user'

import { aaaData, successResponse, aaaList, aaaTemplateList } from './__tests__/fixtures'
import { AAAForm }                                            from './AAAForm'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const params = {
  networkId: 'UNKNOWN-NETWORK-ID',
  tenantId: 'tenant-id',
  type: 'wifi',
  policyId: 'policy-id'
}
describe('AAAForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => res(ctx.json(aaaData))
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (_, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(aaaList))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplateList.url,
        (_, res, ctx) => res(ctx.json(aaaTemplateList))
      )
    )
  })

  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockedUseConfigTemplate.mockRestore()
  })

  it('should create AAA successfully', async () => {
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.click(await screen.findByText('Add Secondary Server'))
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[0],
    '2.3.3.4')
    fireEvent.change((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[0],
    { target: { value: '2.3.3.4' } })
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
      'test1234')
    await userEvent.click(await screen.findByRole('radio', { name: /Authentication/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Accounting/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Authentication/ }))
    const inputProfile = await screen.findByLabelText(/Profile Name/)
    fireEvent.change(inputProfile, { target: { value: 'test1' } })
    fireEvent.blur(inputProfile)
    fireEvent.change(inputProfile, { target: { value: 'create aaa test' } })
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[1],
    '2.3.3.4')
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[1],
    'test1234')
    await screen.findByText('Add')
    // FIXME:
    // await userEvent.click(await screen.findByText('Finish'))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><AAAForm edit={false} networkView={false}/></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'RADIUS Server'
    })).toBeVisible()
  })

  it.skip('should edit AAA successfully', async () => {
    await editAAA()
  })

  it('should validate the length of the Shared Secret', async () => {
    render(<Provider><AAAForm edit={false} networkView={false}/></Provider>, {
      route: { params }
    })

    // eslint-disable-next-line max-len
    const longSecret = '@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5Ag1'
    const primarySecret = await screen.findByLabelText('Shared Secret')

    await userEvent.type(primarySecret, longSecret)
    const primaryAlert = await screen.findByRole('alert')
    expect(primaryAlert).toHaveTextContent('255 characters')

    await userEvent.click(await screen.findByRole('button', { name: /Add Secondary Server/ }))
    const secondaryFieldset = await screen.findByRole('group', { name: /Secondary Server/ })
    const secondarySecret = await within(secondaryFieldset).findByLabelText('Shared Secret')
    await userEvent.type(secondarySecret, longSecret)
    const secondaryAlert = await within(secondaryFieldset).findByRole('alert')
    expect(secondaryAlert).toHaveTextContent('255 characters')
  })

  it('should create AAA template successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const addTemplateFn = jest.fn()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.addAAAPolicyTemplate.url,
        (_, res, ctx) => {
          addTemplateFn()
          return res(ctx.json(successResponse))
        }
      )
    )
    render(
      <Provider>
        <AAAForm edit={false} />
      </Provider>, { route: { params } }
    )

    await userEvent.type(await screen.findByLabelText(/Profile Name/), 'AAA template')
    await userEvent.type(await screen.findByLabelText(/IP Address/), '2.3.3.4')
    await userEvent.type(await screen.findByLabelText(/Shared Secret/), 'test1234')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await waitFor(() => expect(addTemplateFn).toHaveBeenCalled())
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalled())
  })

  it('should update AAA template successfully', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const updateTemplateFn = jest.fn()

    mockServer.use(
      rest.put(
        ConfigTemplateUrlsInfo.updateAAAPolicyTemplate.url,
        (_, res, ctx) => {
          updateTemplateFn()
          return res(ctx.json(successResponse))
        }
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplate.url,
        (_, res, ctx) => res(ctx.json(aaaData))
      )
    )
    render(
      <Provider>
        <AAAForm edit={true} />
      </Provider>, { route: { params } }
    )

    expect(await screen.findByDisplayValue(aaaData.name)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(updateTemplateFn).toHaveBeenCalled())
  })
})

async function editAAA (){
  render(<Provider><AAAForm edit={true} networkView={false}/></Provider>, {
    route: { params }
  })
  fireEvent.change((await screen.findAllByLabelText('IP Address'))[0],
    { target: { value: '2.3.3.4' } })
  await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
    'test1234')
  const port2 = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[1]
  fireEvent.change((await screen.findAllByLabelText('IP Address'))[1],
    { target: { value: '2.3.3.4' } })
  await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
    'test1234')
  await fillInProfileName('test1')
  await userEvent.click(await screen.findByText('Finish'))
  await userEvent.type(port2, '1812')
  await fillInProfileName('test2 update')
  // FIXME: Do not use "setTimeout"
  // await userEvent.click(await screen.findByText('Finish'))
  // await new Promise((r)=>{setTimeout(r, 300)})
}
async function fillInProfileName (name: string) {
  const insertInput = await screen.findByLabelText(/Profile Name/)
  fireEvent.change(insertInput, { target: { value: name } })
  fireEvent.blur(insertInput)
}
