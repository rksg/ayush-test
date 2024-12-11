import { render, screen, fireEvent } from '@testing-library/react'
import userEvent                     from '@testing-library/user-event'
import { rest }                      from 'msw'
import { IntlProvider }              from 'react-intl'

import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { PersonaUrls, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                             from '@acx-ui/store'
import { mockServer, waitFor }                  from '@acx-ui/test-utils'

import { mockedPolicySet, mockPersonaGroupTableResult } from './__tests__/fixtures'

import { IdentityGroupForm } from './index'

describe('IdentityGroupForm', () => {
  const callback = jest.fn()
  const addPersonaGroup = jest.fn()
  const associatePolicySet = jest.fn()

  const setup = () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <IdentityGroupForm callback={callback}/>
        </IntlProvider>
      </Provider>)
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({ ...mockedPolicySet }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.post(
        PersonaUrls.addPersonaGroup.url,
        (req, res, ctx) => {
          addPersonaGroup()
          return res(ctx.json({ id: 'identityId', requestId: '123123123' }))
        }
      ),
      rest.put(
        PersonaUrls.associatePolicySet.url,
        (req, res, ctx) => {
          associatePolicySet()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('calls callback with identityGroupId on successful form submission', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Identity Group Name'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(addPersonaGroup).toBeCalled())
    await waitFor(() => expect(callback).toBeCalledWith('identityId'))
  })

  it('callback is called with zero argument when clicking cancel', async () => {
    setup()
    fireEvent.click(screen.getByText('Cancel'))
    expect(callback).toHaveBeenCalledWith()
  })

  it('should invoke associate policy when policy set is selected', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.POLICY_IDENTITY_TOGGLE)

    setup()
    fireEvent.change(screen.getByLabelText('Identity Group Name'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    // select policy set
    await userEvent.click(await screen.findByRole('combobox', { name: /Adaptive Policy Set/ }))

    const policySetOption = await screen.findByText(mockedPolicySet.content[0].name)
    expect(policySetOption).toBeInTheDocument()

    await userEvent.click(policySetOption)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(addPersonaGroup).toBeCalled())
    await waitFor(() => expect(associatePolicySet).toBeCalled())
    await waitFor(() => expect(callback).toBeCalledWith('identityId'))
  })

})
