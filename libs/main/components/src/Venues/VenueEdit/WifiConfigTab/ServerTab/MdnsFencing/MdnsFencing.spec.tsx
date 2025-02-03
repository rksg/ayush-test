import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiRbacUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext }          from '..'
import { EditContext, VenueEditContext } from '../../..'

import { mockMdnsFencing, mockRbacMdnsFencing } from './__tests__/fixtures'
import { MdnsFencing }                          from './MdnsFencing'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe.skip('Venue mDNS Fencing', () => {
  let editContextData = {} as EditContext
  const setEditContextData = jest.fn()
  let editServerContextData = {} as ServerSettingContext
  const setEditServerContextData = jest.fn()

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json(mockMdnsFencing))),
      rest.post(CommonUrlsInfo.updateVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      // rbac API
      rest.get(WifiRbacUrlsInfo.getVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json(mockRbacMdnsFencing))),
      rest.post(WifiRbacUrlsInfo.updateVenueMdnsFencingPolicy.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it ('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <MdnsFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('switch', { name: 'Use mDNS Fencing Service' })
    )

  })

  it ('should render drawer and save data', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <MdnsFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // MdnsFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // MdnsFencingDrawer
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Service' }),
      await screen.findByRole('option', { name: 'Airport Management' })
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wireless Connection' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it ('should render drawer and cancel', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <MdnsFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // MdnsFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // MdnsFencingDrawer
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Service' }),
      await screen.findByRole('option', { name: 'Airport Management' })
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wireless Connection' }))
    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))
    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Service' }),
      await screen.findByRole('option', { name: 'Other' })
    )

    expect(await screen.findByText(/custom service name/i)).toBeVisible()

    const customServiceName = await screen.findByRole('textbox', { name: /custom service name/i })
    fireEvent.change(customServiceName, { target: { value: 'csn' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it ('should at least one fencing rule in the Wired Connection settings', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <MdnsFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // MdnsFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // MdnsFencingDrawer
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Service' }),
      await screen.findByRole('option', { name: 'Airport Management' })
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))

    const addButtons= await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('The Wired Connection settings must contain at least one fencing rule.')
  })

  it ('The Custom String List can\'t empty', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditContextData,
          editServerContextData,
          setEditServerContextData }}>
          <Form>
            <MdnsFencing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // MdnsFencingTable
    await screen.findByText('Manage Fencing services')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add Service' })
    )

    // MdnsFencingDrawer
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Service' }),
      await screen.findByRole('option', { name: 'Airport Management' })
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Custom Mapping' }))

    const addButtons= await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[1])

    await screen.findByText('The Custom String List can\'t empty.')
  })
})
