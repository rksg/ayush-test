/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

import { fakePreference } from '../__tests__/fixtures'

import  { MapRegionFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedUpdatePreference = jest.fn()

jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))


describe('Map is not enabled', () => {
  beforeEach( () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json(fakePreference))
      )
    )
  })

  it('should display not enable when feature flag is off', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByTitle('Map Region')
    expect(await screen.findByText('Map is not enabled.')).toBeInTheDocument()
  })

  it('should not load google map script', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Map is not enabled.')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts.length).toBe(0)
  })
})

describe('Map Region Selector', () => {
  beforeEach(() => {
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

    await userEvent.type(selector, 'k')
    await userEvent.type(selector, 'i')
    await userEvent.type(selector, 'n')
    await screen.findAllByRole('option')
    fireEvent.mouseOver(await screen.findByTitle('United Kingdom'))

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(screen.getByText('United Kingdom'))
      expect(await screen.findByTitle('United Kingdom')).toBeDefined()
      expect(mockedUpdatePreference).toBeCalledWith({ global: { mapRegion: 'GB' } })
    })
  })

  it('should update google map script correctly', async () => {
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

    await waitFor(async () => {
      expect((await screen.findAllByTitle('United Kingdom')).length).toBe(2)
    })

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    await waitFor(async () => {
      expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')
    })

    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])
  })
})