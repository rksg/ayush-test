import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, defaultComDisplay, Portal, PortalUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                     from '@acx-ui/user'
import { loadImageWithJWT }                                                 from '@acx-ui/utils'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import { PortalForm } from './PortalForm'
export const portalResponse: Portal = {
  id: '1',
  serviceName: 'test111',
  network: [],
  content: {
    bgColor: 'var(--acx-primary-white)',
    bgImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
    'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBgColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLangCode: 'en',
    wifi4EUNetworkId: '',
    alternativeLang: {
      cs: false,
      zh_TW: false,
      fi: false,
      fr: false,
      de: false,
      el: false,
      hu: false,
      it: false
    }
  }
}
jest.mock('@acx-ui/utils')
const mockedData = loadImageWithJWT as jest.MockedFunction<typeof loadImageWithJWT>
async function fillInBeforeSettings (portalName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: portalName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
}
describe.skip('PortalForm', () => {
  beforeEach(() => {
    mockedData.mockReturnValue(Promise.resolve('testId'))
  })
  it('should edit open Portal successfully', async () => {

    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }

    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(portalResponse))
        }),
      rest.put(PortalUrlsInfo.updatePortal.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.post(CommonUrlsInfo.getUploadURL.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: '/api/test', fileId: 'test' }))
        }),
      rest.get(PortalUrlsInfo.getPortalProfileList.url,
        (_, res, ctx) => {
          return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }] }))
        })
    )

    render(<Provider><PortalForm editMode={true}/></Provider>, {
      route: { params }
    })
    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
  })
  it('should cancel successfully', async () => {
    const cancelPortalRes: Portal = { ...portalResponse, content: { ...portalResponse.content,
      componentDisplay: { ...portalResponse.content.componentDisplay, wifi4eu: true } }
    }
    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }

    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json(cancelPortalRes))
        }),
      rest.put(PortalUrlsInfo.updatePortal.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.post(CommonUrlsInfo.getUploadURL.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: '/api/test', fileId: 'test' }))
        }),
      rest.get(PortalUrlsInfo.getPortalProfileList.url,
        (_, res, ctx) => {
          return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }] }))
        })
    )

    render(<Provider><PortalForm editMode={true}/></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('open portal edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})
