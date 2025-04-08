import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ConfigTemplateContext, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor }           from '@acx-ui/test-utils'

import { EnforceTemplateToggle } from '.'

describe('EnforceTemplateToggle', () => {
  const saveEnforcementConfig = jest.fn()
  // eslint-disable-next-line max-len
  const setSaveEnforcementConfigFn = jest.fn().mockImplementation(fn => saveEnforcementConfig.mockImplementation(fn))
  const updateEnforcementOnServer = jest.fn()

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_ENFORCED)

    updateEnforcementOnServer.mockClear()
    setSaveEnforcementConfigFn.mockClear()
    saveEnforcementConfig.mockReset()

    mockServer.use(
      rest.put(
        ConfigTemplateUrlsInfo.updateEnforcement.url,
        (req, res, ctx) => {
          updateEnforcementOnServer(req.body)
          return res(ctx.json({ requestId: 'update12345' }))
        }
      )
    )
  })

  it('renders Switch and text correctly', async () => {
    render(<Provider>
      <ConfigTemplateContext.Provider value={{
        isTemplate: true,
        setSaveEnforcementConfigFn: setSaveEnforcementConfigFn
      }}>
        <EnforceTemplateToggle initValue={true} />
      </ConfigTemplateContext.Provider>
    </Provider>)

    expect(screen.getByText('Enforce template configuration')).toBeVisible()

    await waitFor(() => { expect(screen.getByRole('switch')).toBeChecked() })

    await waitFor(() => { expect(setSaveEnforcementConfigFn).toHaveBeenCalledTimes(1) })

    saveEnforcementConfig('TEMPLATE_ID')

    // eslint-disable-next-line max-len
    await waitFor(() => { expect(updateEnforcementOnServer).toHaveBeenCalledWith({ isEnforced: true }) })

    await userEvent.click(screen.getByRole('switch'))

    await waitFor(() => { expect(setSaveEnforcementConfigFn).toHaveBeenCalledTimes(2) })

    saveEnforcementConfig('TEMPLATE_ID')

    // eslint-disable-next-line max-len
    await waitFor(() => { expect(updateEnforcementOnServer).toHaveBeenCalledWith({ isEnforced: false }) })
  })
})
