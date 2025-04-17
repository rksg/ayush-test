import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { rest }            from 'msw'

import { StepsForm }                                             from '@acx-ui/components'
import { networkApi }                                            from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, NetworkTypeEnum, VlanPoolRbacUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetworkViewmodelList } from '../../../../__tests__/fixtures'

import { ActivatedNetworksTable } from '.'

const mockedSetFieldValue = jest.fn()
const mockedOnChangeFn = jest.fn()
const mockedGetNetworkViewmodelList = jest.fn()
const { click } = userEvent

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  AddNetworkModal: () => <div data-testid='AddNetworkModal' />
}))

describe('Edge SD-LAN ActivatedNetworksTable', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedGetNetworkViewmodelList.mockReset()
    mockedOnChangeFn.mockReset()
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_req, res, ctx) => res(ctx.json({
          data: mockNetworkViewmodelList,
          page: 0,
          totalCount: mockNetworkViewmodelList.length
        }))
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_req, res, ctx) => {
          mockedGetNetworkViewmodelList()
          return res(ctx.json({
            fields: [
            ],
            totalCount: 0,
            page: 1,
            data: []
          }))
        }
      )
    )
  })
  it('should correctly render', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
              onActivateChange={mockedOnChangeFn}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })
  it('should correctly deactivate by switch', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
              activated={{
                'mocked-venue': [
                  { networkId: 'network_2', networkName: 'MockedNetwork 2' },
                  { networkId: 'network_3', networkName: 'MockedNetwork 3' }
                ]
              }}
              onActivateChange={mockedOnChangeFn}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const firstRow = await screen.findByRole('row', { name: /MockedNetwork 1/i })
    const switchBtn1 = within(firstRow).getByRole('switch')
    const tunnelDropdown1 = within(firstRow).queryByRole('combobox')
    expect(switchBtn1).not.toBeChecked()
    expect(tunnelDropdown1).toBeNull()
    const thirdRow = await screen.findByRole('row', { name: /MockedNetwork 3/i })
    const switchBtn3 = within(thirdRow).getByRole('switch')
    const tunnelDropdown3 = within(thirdRow).queryByRole('combobox')
    expect(switchBtn3).toBeChecked()
    expect(tunnelDropdown3).toBeInTheDocument()
    await click(switchBtn3)
    expect(mockedOnChangeFn).toBeCalledWith({
      id: 'network_3',
      name: 'MockedNetwork 3',
      nwSubType: 'open',
      vlanPool: undefined
    },
    false,
    ['network_2'])
  })
  it('should correctly activate by switcher', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
              onActivateChange={mockedOnChangeFn}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    await click(
      within(await screen.findByRole('row', { name: /MockedNetwork 2/i })).getByRole('switch'))
    expect(mockedOnChangeFn).toBeCalledWith(
      {
        id: 'network_2',
        name: 'MockedNetwork 2',
        nwSubType: NetworkTypeEnum.PSK
      },
      true,
      ['network_2'])
  })

  it('can change column header title by props', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
              columnsSetting={[
                { key: 'name', title: 'Test Title' },
                { key: 'unkownField', title: 'Change non-existent field' }
              ]}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    const rows = await checkPageLoaded()
    await screen.findByRole('columnheader', { name: /Test Title/i })
    expect(screen.queryByRole('columnheader', { name: /Change non-existent field/i })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Active Network' })).toBeNull()
    rows.forEach(row => {
      expect(within(row).getByRole('switch')).not.toBeChecked()
    })
  })

  it('should popup add network modal', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    await userEvent.click(screen.getByRole('button', { name: 'Add Wi-Fi Network' }))
    expect(screen.queryByTestId('AddNetworkModal')).toBeVisible()
  })
  it('should grey out OWE transition network', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const switchBtn = within(await screen.findByRole('row', { name: /MockedNetwork 6/i }))
      .getByRole('switch')
    expect(switchBtn).toBeDisabled()
  })

  it('should grey out network is used by PIN', async () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ActivatedNetworksTable
              venueId='mocked-venue'
              pinNetworkIds={['network_1']}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkPageLoaded()
    const switchBtn = within(await screen.findByRole('row', { name: /MockedNetwork 1/i }))
      .getByRole('switch')
    expect(switchBtn).toBeDisabled()
  })
})

const checkPageLoaded = async (): Promise<HTMLElement[]> => {
  await waitFor(() => expect(mockedGetNetworkViewmodelList).toBeCalled())
  const rows = await screen.findAllByRole('row', { name: /MockedNetwork/i })
  expect(rows.length).toBe(7)
  return rows
}