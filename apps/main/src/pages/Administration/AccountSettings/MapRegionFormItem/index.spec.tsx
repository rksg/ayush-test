/* eslint-disable max-len */
import React from 'react'

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
  waitFor,
  within,
  fireEvent,
  logRoles,
  cleanup,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { fakePreference } from '../__tests__/fixtures'


import  { MapRegionFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedUpdatePreference = jest.fn().mockImplementation(() => {
  console.log('mockedUpdatePreference')
})

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

    jest.mock('@acx-ui/config', () => ({
      get: jest.fn().mockReturnValue('some-key')
    }))

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
    })

    expect(await screen.findByRole('combobox')).toHaveAttribute('value', '')
  })

  it('should be auto-searchable', async () => {
    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })


    await userEvent.click(await screen.findByText('Taiwan'))
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      userEvent.type(screen.getByRole('combobox'), 'kin')
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


// describe('Map Script', () => {
//   beforeEach(() => {
//     mockServer.use(
//       rest.get(
//         AdministrationUrlsInfo.getPreferences.url,
//         (_req, res, ctx) => res(ctx.json(fakePreference))
//       )
//     )

//     jest.mocked(useIsSplitOn).mockReturnValue(true)

//     jest.mock('@acx-ui/config', () => ({
//       get: jest.fn().mockReturnValue('some-key')
//     }))
//   })

//   it('should update google map script correctly', async () => {
//     let params: { tenantId: string } =
//     { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

//     render(
//       <Provider>
//         <MapRegionFormItem />
//       </Provider>, {
//         route: { params }
//       })

//     await userEvent.click(await screen.findByText('Taiwan'))
//     const selector = await screen.findByRole('combobox')
//     // expect(selector).toHaveAttribute('aria-expanded', 'true')

//     userEvent.type(selector, 'kin')
//     userEvent.click(await screen.findByRole('option', { name: 'United Kingdom' }))
//     // userEvent.click(await screen.findByText('United Kingdom'))

//     // eslint-disable-next-line testing-library/no-node-access
//     const script = document.getElementsByTagName('script')
//     for(let i = 0; i<script.length; i++) {
//       console.log(script[i].src)
//     }

//     expect(script[0].src).toEqual(
//       'https://maps.googleapis.com/maps/api/js' +
//     '?key=some-key&region=GB&libraries=places&language=en')
//   })

// })