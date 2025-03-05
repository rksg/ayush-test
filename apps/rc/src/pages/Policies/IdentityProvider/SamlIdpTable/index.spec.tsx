import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CertificateUrls,
  CommonUrlsInfo,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { dummyNetworksResult } from '../__tests__/fixtures'

import { certList, mockSamlIdpProfileId, mockedSamlIpdProfileList } from './__tests__/fixtures'

import SamlIdpTable from '.'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const mockedUseNavigate = jest.fn()

const mockUseLocationValue = {
  pathname: getPolicyListRoutePath(),
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))


const mockedSingleDeleteApi = jest.fn()


describe('SAML IdP Profile Table', ()=>{

  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.SAML_IDP,
    oper: PolicyOperation.LIST
  })

  beforeEach(() => {
    params = {
      tenantId: tenantId
    }

    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedSamlIpdProfileList))
        }
      ),

      rest.delete(
        SamlIdpProfileUrls.deleteSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.json(202))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(dummyNetworksResult))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (_, res, ctx) => res(ctx.json(certList))
      )
    )
  })

  it('should create SAML IdP Table successfully', async () => {

    render(
      <Provider>
        <SamlIdpTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /__samlIdpProfile_Name/i })
    await waitFor(() =>{
      expect(row.length).toBe(mockedSamlIpdProfileList.totalCount)
    })
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /__samlIdpProfile_Name__/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.SAML_IDP,
        oper: PolicyOperation.EDIT,
        policyId: mockSamlIdpProfileId
      })}`,
      hash: '',
      search: ''
    })
  })

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /__samlIdpProfile_Name__/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "__samlIdpProfile_Name__"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('popup display metadata', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpTable />
      </Provider>, {
        route: { params, path: tablePath }
      })

    await user.click(screen.getByTestId('display-metadata-button-' + mockSamlIdpProfileId))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('IdP Metadata')).toBeVisible()

  })
})
