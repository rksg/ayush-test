/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  cleanup,
  waitFor
} from '@acx-ui/test-utils'

import { fakePreference } from '../__tests__/fixtures'

import  { MapRegionFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    allowClear,
    optionFilterProp,
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, allowClear:boolean, optionFilterProp: string, onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  countryCodes: [{
    label: 'invalid',
    value: ''
  },{
    label: 'Taiwan',
    value: 'TW'
  },{
    label: 'United Kingdom',
    value: 'GB'
  },{
    label: 'Singapore',
    value: 'SG'
  }]
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
    cleanup()
  })
})

describe('Map Region Selector', () => {
  let mockedUpdatePreference: (r: unknown) => void
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
  it('should be able to clear selector input', async () => {
    const _mocked = jest.fn()
    mockedUpdatePreference = _mocked

    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Taiwan')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    await userEvent.selectOptions( await screen.findByRole('combobox'), 'invalid')
    expect(mockedUpdatePreference).toBeCalledTimes(0)
  })

  it('should be changable', async () => {
    const _mocked = jest.fn()
    mockedUpdatePreference = _mocked

    render(
      <Provider>
        <MapRegionFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Taiwan')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    await userEvent.selectOptions( await screen.findByRole('combobox'), 'United Kingdom')
    await waitFor(async () => {
      expect(mockedUpdatePreference).toBeCalled()
    })
  })
})
