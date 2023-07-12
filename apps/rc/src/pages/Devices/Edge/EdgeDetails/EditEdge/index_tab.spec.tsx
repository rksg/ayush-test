import userEvent                                    from '@testing-library/user-event'
import { rest }                                     from 'msw'
import { IntlProvider }                             from 'react-intl'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList } from '../../__tests__/fixtures'

import { EdgeEditContext, EditEdgeTabs } from './index'


jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

const defaultContextData = {
  activeSubTab: {
    key: '',
    title: ''
  },
  formControl: {
    isDirty: true,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

describe('EditEdge_tab', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('Unsaved changes modal pop up wihtout error - discard', async () => {
    const user= userEvent.setup()
    const getWrapper = () =>
      ({ children }: { children: React.ReactElement }) => (
        <IntlProvider locale='en'>
          <Provider>
            <MemoryRouter initialEntries={['/t-id/t/devices/edge/001/edit/ports/ports-general']}>
              <Routes>
                {
                  // eslint-disable-next-line max-len
                  <Route path='/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
                    element={
                      <div>
                        <EdgeEditContext.Provider
                          value={defaultContextData}
                        >
                          <EditEdgeTabs />
                        </EdgeEditContext.Provider>
                        {children}
                      </div>
                    } />
                }
              </Routes>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      )
    const { result } = renderHook(() => useNavigate(), { wrapper: getWrapper() })
    const navigate = result.current
    navigate('test')
    const unsavedModal = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await within(unsavedModal).findByText('Do you want to save your changes in "", or discard all changes?')
    const btns = within(unsavedModal).getAllByRole('button')
    expect(btns.length).toBe(5)
    await user.click(within(unsavedModal).getByRole('button', { name: 'Discard Changes' }))
    await waitFor(() => expect(unsavedModal).not.toBeVisible())
  })

  it('Unsaved changes modal pop up wihtout error - cancel', async () => {
    const user= userEvent.setup()
    const getWrapper = () =>
      ({ children }: { children: React.ReactElement }) => (
        <IntlProvider locale='en'>
          <Provider>
            <MemoryRouter initialEntries={['/t-id/t/devices/edge/001/edit/ports/ports-general']}>
              <Routes>
                {
                  // eslint-disable-next-line max-len
                  <Route path='/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
                    element={
                      <div>
                        <EdgeEditContext.Provider
                          value={defaultContextData}
                        >
                          <EditEdgeTabs />
                        </EdgeEditContext.Provider>
                        {children}
                      </div>
                    } />
                }
              </Routes>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      )
    const { result } = renderHook(() => useNavigate(), { wrapper: getWrapper() })
    const navigate = result.current
    navigate('test')
    const unsavedModal = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await within(unsavedModal).findByText('Do you want to save your changes in "", or discard all changes?')
    const btns = within(unsavedModal).getAllByRole('button')
    expect(btns.length).toBe(5)
    await user.click(within(unsavedModal).getAllByRole('button', { name: 'Cancel' })[0])
    await waitFor(() => expect(unsavedModal).not.toBeVisible())
  })

  it('Unsaved changes modal pop up wihtout error - save', async () => {
    const user= userEvent.setup()
    const getWrapper = () =>
      ({ children }: { children: React.ReactElement }) => (
        <IntlProvider locale='en'>
          <Provider>
            <MemoryRouter initialEntries={['/t-id/t/devices/edge/001/edit/ports/ports-general']}>
              <Routes>
                {
                  // eslint-disable-next-line max-len
                  <Route path='/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
                    element={
                      <div>
                        <EdgeEditContext.Provider
                          value={defaultContextData}
                        >
                          <EditEdgeTabs />
                        </EdgeEditContext.Provider>
                        {children}
                      </div>
                    } />
                }
              </Routes>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      )
    const { result } = renderHook(() => useNavigate(), { wrapper: getWrapper() })
    const navigate = result.current
    navigate('test')
    const unsavedModal = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await within(unsavedModal).findByText('Do you want to save your changes in "", or discard all changes?')
    const btns = within(unsavedModal).getAllByRole('button')
    expect(btns.length).toBe(5)
    await user.click(within(unsavedModal).getByRole('button', { name: 'Save Changes' }))
    await waitFor(() => expect(unsavedModal).not.toBeVisible())
  })

})
