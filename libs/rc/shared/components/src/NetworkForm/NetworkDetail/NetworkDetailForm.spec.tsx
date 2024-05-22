import { Form } from 'antd'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen
}   from '@acx-ui/test-utils'

import { MLOContext } from '../NetworkForm'

import { NetworkDetailForm } from './NetworkDetailForm'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('NetworkDetailForm', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('network template should render Network Detail page without Hotspot 2.0 type', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form><NetworkDetailForm /></Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(await screen.findByText('Network Type')).toBeVisible()
    expect(await screen.findByText('Enterprise AAA (802.1X)')).toBeVisible()
    expect(screen.queryByText('Hotspot 2.0 Access')).not.toBeInTheDocument()
  })

  it('general network should render Network Detail page with Hotspot 2.0 type', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    render(
      <Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form><NetworkDetailForm /></Form>
        </MLOContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    expect(await screen.findByText('Network Type')).toBeVisible()
    expect(await screen.findByText('Enterprise AAA (802.1X)')).toBeVisible()
    expect(await screen.findByText('Hotspot 2.0 Access')).toBeVisible()
  })
})