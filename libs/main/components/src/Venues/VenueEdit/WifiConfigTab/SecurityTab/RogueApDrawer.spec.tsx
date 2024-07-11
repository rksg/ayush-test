import '@testing-library/jest-dom'
import React from 'react'

import { rest } from 'msw'

import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { PoliciesConfigTemplateUrlsInfo, RogueApUrls, ConfigTemplateContext } from '@acx-ui/rc/utils'
import { Provider }                                                           from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                from '@acx-ui/test-utils'

import { VenueEditContext }        from '../..'
import { mockedRogueApPolicyRbac } from '../../../__tests__/fixtures'

import RogueApDrawer from './RogueApDrawer'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}
const mockRoguePolicyQuery = jest.fn()

describe('RogueApDrawer', () => {
  it('uses RogueApUrls.getRoguePolicyRbac.url when enableRbac is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockServer.use(
      rest.get(RogueApUrls.getRoguePolicyRbac.url, (req, res, ctx) => {
        mockRoguePolicyQuery()
        return res(ctx.json(mockedRogueApPolicyRbac))
      })
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          setEditContextData: jest.fn(),
          setEditSecurityContextData: jest.fn()
        }}>
          <RogueApDrawer visible={true} setVisible={() => {}} policyId='policyId' />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })


    await waitFor(() => expect(mockRoguePolicyQuery).toBeCalled())

    await screen.findByTitle('Classification rules (1)')

    await screen.findByText('123123')
  })

  // eslint-disable-next-line max-len
  it('uses PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac.url when RBAC_CONFIG_TEMPLATE_TOGGLE is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

    mockServer.use(
      rest.get(PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac.url, (req, res, ctx) => {
        mockRoguePolicyQuery()
        return res(ctx.json(mockedRogueApPolicyRbac))
      })
    )

    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider>
          <VenueEditContext.Provider value={{
            setEditContextData: jest.fn(),
            setEditSecurityContextData: jest.fn()
          }}>
            <RogueApDrawer visible={true} setVisible={() => {}} policyId='policyId' />
          </VenueEditContext.Provider>
        </Provider>
      </ConfigTemplateContext.Provider>, { route: { params } })


    await waitFor(() => expect(mockRoguePolicyQuery).toBeCalled())

    await screen.findByTitle('Classification rules (1)')

    await screen.findByText('123123')
  })
})
