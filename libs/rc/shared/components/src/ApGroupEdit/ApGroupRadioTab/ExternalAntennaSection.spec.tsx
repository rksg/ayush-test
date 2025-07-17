import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
}                                                                         from '@acx-ui/test-utils'

import {
  venuelist,
  apGroupApCaps,
  mockVenueExternalAntennas,
  mockApGroupExternalAntennas,
  mockApGroupAntennaTypeSettings,
  mockAntennaTypeSettings
} from '../__tests__/fixtures'
import { ApGroupEditContext } from '../context'

import { ExternalAntennaSection } from './ExternalAntennaSection'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn(({ onOk }) => {
    if (onOk) onOk()
  })
}))

const setEditContextDataFn = jest.fn()
const setEditRadioContextDataFn = jest.fn()
const updateExternalAntennaFn = jest.fn()
const updateAntennaTypeFn = jest.fn()
const mockedGetApGroupExternalAntennas = jest.fn()
const mockedGetVenueExternalAntennas = jest.fn()
const mockedApGroupListReq = jest.fn()
const mockedGetApGroupAntennaType = jest.fn()

const venueData = venuelist.data[0]
const venueId = venueData.id

const defaultApGroupCxtdata = {
  isRbacEnabled: true,
  previousPath: '/ap-groups',
  setPreviousPath: jest.fn(),
  isEditMode: false,
  isWifiRbacEnabled: false,
  editContextData: {
    tabTitle: 'Radio',
    isDirty: false
  },
  editRadioContextData: {
    updateExternalAntenna: updateExternalAntennaFn,
    updateAntennaType: updateAntennaTypeFn,
    apiApModels: {},
    apModels: {},
    apModelAntennaTypes: {}
  },
  venueId,
  venueData: { ...venueData, mesh: { enabled: false } } as any,
  apGroupApCaps,
  setEditContextData: setEditContextDataFn,
  setEditRadioContextData: setEditRadioContextDataFn
}

const mockAPGroupList = {
  fields: [
    'venueId',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'apgroup-id',
      venueId: '5e75f787e010471984b18ad0eb156487'
    }
  ]
}

const renderComponent = (contextOverrides = {}) => {
  return render(
    <Provider>
      <Form>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          ...contextOverrides
        }}>
          <ExternalAntennaSection isAllowEdit={true} />
        </ApGroupEditContext.Provider>
      </Form>
    </Provider>,
    {
      route: {
        params: {
          tenantId: 'tenant-id',
          apGroupId: 'apgroup-id',
          action: 'edit',
          activeTab: 'radio'
        },
        path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab'
      }
    }
  )
}

describe('ExternalAntennaSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(mockVenueExternalAntennas))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => {
          mockedGetVenueExternalAntennas()
          return res(ctx.json(mockVenueExternalAntennas))
        }
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupExternalAntenna.url,
        (_, res, ctx) => {
          mockedGetApGroupExternalAntennas()
          return res(ctx.json(mockApGroupExternalAntennas))
        }
      ),
      rest.put(
        WifiUrlsInfo.updateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        WifiUrlsInfo.getVenueAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockAntennaTypeSettings))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupAntennaType.url,
        (_, res, ctx) => {
          mockedGetApGroupAntennaType()
          return res(ctx.json(mockApGroupAntennaTypeSettings))
        }
      ),
      rest.put(
        WifiUrlsInfo.updateVenueAntennaType.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          mockedApGroupListReq()
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockAPGroupList))
        }
      )
    )
  })

  it('should render correctly with default settings', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    expect(screen.getByTestId('external-antenna-section')).toBeInTheDocument()
    expect(screen.getByText(/use inherited settings from/i)).toBeInTheDocument()
    expect(screen.getByText(/customize settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ap model/i)).toBeInTheDocument()
  })

  it('should show venue settings selected by default', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    const venueSettingsRadio = screen.getByTestId('apGroup-useVenueSettings')
    const customizeRadio = screen.getByTestId('apGroup-customize')

    expect(venueSettingsRadio).toBeChecked()
    expect(customizeRadio).not.toBeChecked()
  })

  it('should handle switching between venue settings and customize', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    const customizeRadio = screen.getByTestId('apGroup-customize')
    await userEvent.click(customizeRadio)

    expect(customizeRadio).toBeChecked()
    expect(setEditRadioContextDataFn).toHaveBeenCalled()
  })

  it('should handle AP model selection', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await screen.findByText('No model selected')
    const apModelSelect = await screen.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))
  })

  it('should display external antenna form when model is selected', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    await screen.findByText('No model selected')
    const apModelSelect = await screen.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))

    expect(screen.getByRole('img', {
      name: /ap external antenna image/i
    })).toBeInTheDocument()
  })

  it('should handle external antenna changes', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    await screen.findByText('No model selected')
    const apModelSelect = await screen.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))

    expect((await screen.findAllByTitle('T350SE'))[1]).toBeInTheDocument()
  })

  it('should handle antenna type changes', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(feature =>
      feature === Features.WIFI_ANTENNA_TYPE_TOGGLE
    )

    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    await screen.findByText('No model selected')
    const apModelSelect = await screen.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T670SN'))

    expect((await screen.findAllByTitle('T670SN'))[1]).toBeInTheDocument()
  })

  it('should show AP model placeholder image when no model is selected', async () => {
    renderComponent()

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    const image = screen.getByAltText('AP external Antenna image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('ApModelPlaceholder'))
  })

  it('should handle isAllowEdit prop correctly', async () => {
    render(
      <Provider>
        <Form>
          <ApGroupEditContext.Provider value={defaultApGroupCxtdata}>
            <ExternalAntennaSection isAllowEdit={false} />
          </ApGroupEditContext.Provider>
        </Form>
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'tenant-id',
            apGroupId: 'apgroup-id',
            action: 'edit',
            activeTab: 'radio'
          },
          path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    expect(screen.getByTestId('external-antenna-section')).toBeInTheDocument()
  })

})
