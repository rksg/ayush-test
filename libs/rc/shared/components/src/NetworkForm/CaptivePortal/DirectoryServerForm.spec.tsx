import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { StepsFormLegacy }                                            from '@acx-ui/components'
import { AaaUrls, CommonUrlsInfo, WifiUrlsInfo, DirectoryServerUrls } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                        from '@acx-ui/test-utils'
import { UserUrlsInfo }                                               from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  cloudPathDataNone,
  mockAAAPolicyListResponse,
  mockedCloudPathAuthRadius,
  mockedCloudPathAcctRadius,
  mockedDirectoryServerProfiles
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { DirectoryServerForm } from './DirectoryServerForm'

describe('CaptiveNetworkForm-Directory', () => {
  const setNetworkFormValueFunction = jest.fn()
  const directoryServerAPI = jest.fn()
  beforeEach(() => {
    networkDeepResponse.name = 'Directory network test'
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: cloudPathDataNone.guestPortal,
      wlan: { ...networkDeepResponse.wlan, ...cloudPathDataNone.wlan } }
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(wisprRes))),
      rest.get(AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          // eslint-disable-next-line max-len
          return res(ctx.json(req.params.venueId === '21' ? mockedCloudPathAuthRadius : mockedCloudPathAcctRadius))
        }
      ),
      rest.post(DirectoryServerUrls.getDirectoryServerViewDataList.url,
        (_, res, ctx) => {
          directoryServerAPI()
          return res(ctx.json(mockedDirectoryServerProfiles))
        })
    )
  })

  const params = {
    networkId: '5c342542bb824a8b981a9bb041a8a2da',
    tenantId: 'tenant-id',
    action: 'edit'
  }

  it('should test WISPr network successfully', async () => {
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true, cloneMode: true, data: cloudPathDataNone
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm
                  setDirectoryServerIdToNetworkForm={setNetworkFormValueFunction}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
    await waitFor(async () => {
      expect(directoryServerAPI).toBeCalled()
    })
    const server = screen.getByTestId('directory-server-select')
    expect(server).toBeInTheDocument()
    userEvent.click(screen.getByText('Select...'))
    expect(await screen.findByText('ldap-profile1')).toBeInTheDocument()
  })
})