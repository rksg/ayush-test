import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import {
  ConfigTemplateContext,
  ConfigTemplateType, ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EnforceTemplateToggle } from '.'

describe('EnforceTemplateToggle', () => {
  const saveEnforcementConfig = jest.fn()
  // eslint-disable-next-line max-len
  const setSaveEnforcementConfigFn = jest.fn().mockImplementation(fn => saveEnforcementConfig.mockImplementation(fn))
  const updateEnforcementOnServer = jest.fn()
  const deleteEnforcementOnServer = jest.fn()
  const mockedConfigTemplate = {
    id: 'template12345',
    name: 'Template 1',
    createdOn: 1690598400000,
    createdBy: 'Author 1',
    type: ConfigTemplateType.NETWORK,
    lastModified: 1690598400000,
    lastApplied: 1690598405000,
    enforced: true
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_ENFORCED)

    updateEnforcementOnServer.mockClear()
    deleteEnforcementOnServer.mockClear()
    setSaveEnforcementConfigFn.mockClear()
    saveEnforcementConfig.mockReset()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getConfigTemplatesRbac.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 1,
          page: 1,
          data: [mockedConfigTemplate]
        }))
      ),
      rest.put(
        ConfigTemplateUrlsInfo.updateEnforcement.url,
        (req, res, ctx) => {
          updateEnforcementOnServer()
          return res(ctx.json({ requestId: 'update12345' }))
        }
      ),
      rest.delete(
        ConfigTemplateUrlsInfo.deleteEnforcement.url,
        (req, res, ctx) => {
          deleteEnforcementOnServer()
          return res(ctx.json({ requestId: 'delete12345' }))
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
        <EnforceTemplateToggle templateId={mockedConfigTemplate.id} />
      </ConfigTemplateContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByText('Enforce template configuration')).toBeVisible()

    await waitFor(() => { expect(screen.getByRole('switch')).toBeChecked() })

    // The `setSaveEnforcementConfigFn` function in `useEffect` is executed twice:
    // the first time during initialized render, and the second time when the API returns data and `checked` has a value.
    await waitFor(() => { expect(setSaveEnforcementConfigFn).toHaveBeenCalledTimes(2) })

    saveEnforcementConfig(mockedConfigTemplate.id)

    await waitFor(() => { expect(updateEnforcementOnServer).toHaveBeenCalledTimes(1) })

    await userEvent.click(screen.getByRole('switch'))

    await waitFor(() => { expect(setSaveEnforcementConfigFn).toHaveBeenCalledTimes(3) })

    saveEnforcementConfig(mockedConfigTemplate.id)

    await waitFor(() => { expect(deleteEnforcementOnServer).toHaveBeenCalledTimes(1) })
  })
})
