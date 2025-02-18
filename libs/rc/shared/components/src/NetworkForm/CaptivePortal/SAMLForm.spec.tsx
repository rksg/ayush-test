import {
  cloudPathDataNone,
  mockAAAPolicyListResponse,
  mockedCloudPathAcctRadius,
  mockedCloudPathAuthRadius,
  mockedDirectoryServerProfiles,
  networkDeepResponse,
  networksResponse,
  successResponse,
  venueListResponse,
  venuesResponse
} from '../__tests__/fixtures';
import { AaaUrls, CommonUrlsInfo, DirectoryServerUrls, GuestNetworkTypeEnum, WifiUrlsInfo } from '@acx-ui/rc/utils';
import { Provider, store } from '@acx-ui/store';
import { directoryServerApi } from '@acx-ui/rc/services';
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils';
import { rest } from 'msw';
import { UserUrlsInfo } from '@acx-ui/user';
import NetworkFormContext from '../NetworkFormContext';
import { MLOContext } from '@acx-ui/rc/components';
import { StepsFormLegacy } from '@acx-ui/components';
import {SAMLForm} from './SAMLForm';

describe('CaptiveNetworkForm-SAML', () => {
  const directoryServerAPI = jest.fn()

  beforeEach(() => {
    networkDeepResponse.name = 'Directory network test'
    directoryServerAPI.mockClear()
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        guestNetworkType: GuestNetworkTypeEnum.Directory
      },
      wlan: { ...networkDeepResponse.wlan, ...cloudPathDataNone.wlan } }
    store.dispatch(directoryServerApi.util.resetApiState())
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

  it('should test edit network successfully', async () => {
    const directoryServerDataRef = { current: { id: '', name: '' } }
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true,
            cloneMode: false,
            data: { ...cloudPathDataNone, id: params.networkId },
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
    await waitFor(() => expect(directoryServerAPI).toBeCalled())
  })
})
