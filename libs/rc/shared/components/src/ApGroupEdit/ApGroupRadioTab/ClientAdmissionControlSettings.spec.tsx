import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { WifiRbacUrlsInfo }                                      from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { apGroupClientAdmissionControl, venueClientAdmissionControl } from '../__tests__/fixtures'
import { ApGroupEditContext }                                         from '../context'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'

const params = { tenantId: 'tenant-id', apGroupId: 'apgroup-id', venueId: 'venue-id' }
const venueId = params.venueId

const defaultContext = {
  isRbacEnabled: true,
  isEditMode: true,
  previousPath: '/ap-groups',
  setPreviousPath: jest.fn(),
  apGroupApCaps: undefined,
  venueId,
  editContextData: {
    tabTitle: '',
    isDirty: false,
    updateChanges: jest.fn(),
    discardChanges: jest.fn()
  },
  setEditContextData: jest.fn(),
  editRadioContextData: {},
  setEditRadioContextData: jest.fn()
}

describe('ApGroup Client Admission Control Settings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApGroupClientAdmissionControlSettings.url,
        (_, res, ctx) => res(ctx.json(apGroupClientAdmissionControl))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(venueClientAdmissionControl))
      ),
      rest.put(
        WifiRbacUrlsInfo.updateApGroupClientAdmissionControlSettings.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render correctly when using venue settings', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={defaultContext}>
          <Form>
            <ClientAdmissionControlSettings />
          </Form>
        </ApGroupEditContext.Provider>
      </Provider>,
      { route: { params } }
    )
    if (screen.queryByLabelText('loader')) {
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    }
    expect(await screen.findByTestId('client-admission-control-useVenueSettings')).toBeChecked()
    expect(
      await screen.findByTestId('client-admission-control-enable-read-only-24g')
    ).toHaveTextContent('Off')
    expect(
      await screen.findByTestId('client-admission-control-enable-read-only-50g')
    ).toHaveTextContent('Off')
  })

  it('should render correctly when using custom settings', async () => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getApGroupClientAdmissionControlSettings.url,
        (_, res, ctx) =>
          res(ctx.json({ ...apGroupClientAdmissionControl, useVenueSettings: false }))
      )
    )
    render(
      <Provider>
        <ApGroupEditContext.Provider value={defaultContext}>
          <Form>
            <ClientAdmissionControlSettings />
          </Form>
        </ApGroupEditContext.Provider>
      </Provider>,
      { route: { params } }
    )
    if (screen.queryByLabelText('loader')) {
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    }
    expect(await screen.findByTestId('client-admission-control-customizeSettings')).toBeChecked()
    expect(await screen.findByTestId('client-admission-control-enable-24g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-enable-50g')).toBeVisible()
  })
})
