import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeMdnsProxyViewData, EdgeUrlsInfo, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                             from '@acx-ui/test-utils'

import { AddEdgeMdnsProxyForm } from './AddEdgeMdnsProxyForm'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    options,
    loading,
    ...props
  }: React.PropsWithChildren<{
    options: Array<{ label: string, value: unknown }>,
    loading: boolean,
    onChange?: (value: string) => void }>) => {
    return (loading
      ? <div role='img' data-testid='loadingIcon'>Loading</div>
      : <select {...props}
        onChange={(e) => {
          props.onChange?.(e.target.value)}
        }>
        {/* Additional <option> to ensure it is possible to reset value to empty */}
        <option value={undefined}></option>
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const onFinish = jest.fn()
const onCancel = jest.fn()

const MockComponent = () => {
  return <Provider>
    <AddEdgeMdnsProxyForm
      onFinish={onFinish}
      onCancel={onCancel}
    />
  </Provider>
}

describe('AddEdgeMdnsProxyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ))
  })

  it('should render correctly', async () => {
    render(<MockComponent />)

    const formBody = await checkBasicSettings()
    screen.getByText('Forwarding Rules (0)')

    // eslint-disable-next-line max-len
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), 'mock edge-mdns-proxy-name')

    // add rule
    await userEvent.click(await within(formBody).findByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Type' }),
      within(dialog).getByRole('option', { name: 'Apple TV' }))

    await userEvent.type(within(dialog).getByRole('spinbutton', { name: /From VLAN/i }), '10')
    await userEvent.type(within(dialog).getByRole('spinbutton', { name: /To VLAN/i }), '200')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    await within(formBody).findByRole('row', { name: 'Apple TV 10 200' })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await within(formBody).findByRole('row', { name: /Mock Venue 2 TestCountry2, TestCity2 0/ })

    // to summary step
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const expectedData = {
      name: 'mock edge-mdns-proxy-name',
      forwardingRules: [
        {
          ruleIndex: 0,
          service: 'APPLETV',
          fromVlan: 10,
          toVlan: 200
        }]
    }as EdgeMdnsProxyViewData

    await waitFor(() => expect(onFinish).toBeCalled())
    expect(onFinish.mock.calls[0][0]).toStrictEqual(expectedData)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(<MockComponent />)
    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)
    await waitFor(() => expect(onCancel).toHaveBeenCalled())
  })

  it('renders steps with correct titles', () => {
    render(<MockComponent />)
    expect(screen.getAllByText('Settings').length).toBe(2)
    expect(screen.getByText('Scope')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')
  screen.getByRole('textbox', { name: 'Service Name' })
  return formBody
}