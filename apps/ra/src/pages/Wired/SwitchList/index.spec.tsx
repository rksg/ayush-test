
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider, dataApiSearchURL }                                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { switchList, emptySwitchesList } from './__tests__/fixture'

import { SwitchList } from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath
}))

describe('Switch List', () => {
  it('should render table correctly', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: switchList
    })
    render(<SwitchList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('ICX7250-48 Switch')).toBeVisible()
    expect(screen.getByText('78:A6:E1:01:95:00')).toBeVisible()
    expect(screen.getByText('ICX7250-48')).toBeVisible()
  })

  it('should show no data on empty list', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: emptySwitchesList
    })
    const { container } = render(<SwitchList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.ant-table-expanded-row-fixed')).toHaveLength(1)
  })

  it('should search for the specified text', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: switchList
    })
    render(<SwitchList />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const searchPlaceHolder = 'Search Switch Name, MAC Address, Model, Version'
    userEvent.click(
      await screen.findByPlaceholderText(searchPlaceHolder)
    )
    userEvent.type(
      await screen.findByPlaceholderText(searchPlaceHolder),
      'SPS08095h'
    )
    expect(screen.getByText('SPS08095h')).toBeVisible()
  })
})
