/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  fireEvent
} from '@acx-ui/test-utils'

import { fakePreference } from '../__tests__/fixtures'

import  { MapRegionFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedUpdatePreference = jest.fn()

describe('Map Region Selector', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(administrationApi.util.resetApiState())
    })

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json(fakePreference))
      ),
      rest.put(
        AdministrationUrlsInfo.updatePreferences.url,
        (_req, res, ctx) => {
          mockedUpdatePreference(_req.body)
          return res(ctx.status(200))
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Taiwan')).toBeVisible()
  })

  it('should be able to clear selector input', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(await screen.findByText('Taiwan'))
    const selector = await screen.findByRole('combobox')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.type(selector, 'r')
    })

    const clearIcon = await screen.findByLabelText('close-circle')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.click(clearIcon)
      fireEvent.change(selector, { target: { value: undefined } })
      expect(mockedUpdatePreference).toBeCalledTimes(0)
    })

    expect(await screen.findByRole('combobox')).toHaveAttribute('value', '')
    expect((await screen.findByTitle('Taiwan')).tagName).toBe('SPAN')
    expect(mockedUpdatePreference).toBeCalledTimes(0)
  })

  it('should be auto-searchable', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Taiwan')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.type(selector, 'k')
      await userEvent.type(selector, 'i')
      await userEvent.type(selector, 'n')
      await screen.findByText('United Kingdom')
      fireEvent.click(screen.getByText('United Kingdom'))
      expect(await screen.findByTitle('United Kingdom')).toBeDefined()
      expect(mockedUpdatePreference).toBeCalledWith({ global: { mapRegion: 'GB' } })
    })
  })

  it('should display not enable when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { container } = render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await within(container).findByTitle('Map Region')
    await screen.findByText('Map is not enabled.')
  })
})

describe('Map Script', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json(fakePreference))
      ),
      rest.put(
        AdministrationUrlsInfo.updatePreferences.url,
        (_req, res, ctx) => {
          return res(ctx.status(200))
        }
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should update google map script correctly', async () => {
    let params: { tenantId: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Taiwan')
    await userEvent.click(await screen.findByRole('combobox'))
    const combobox = screen.getByRole('combobox')
    await userEvent.type(combobox, 'k')
    await userEvent.type(combobox, 'i')
    await userEvent.type(combobox, 'n')

    await screen.findAllByRole('option')
    fireEvent.mouseOver(await screen.findByTitle('United Kingdom'))

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(await screen.findByTitle('United Kingdom'))
      fireEvent.blur(screen.getByRole('combobox'))
    })

    expect((await screen.findAllByTitle('United Kingdom')).length).toBe(2)

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')

    expect(scripts[0].src).toContain('&region=GB')

    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])
  })
})
