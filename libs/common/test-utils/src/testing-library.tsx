import { ReactElement } from 'react'

import { render, RenderOptions }                             from '@testing-library/react'
import { ConfigProvider }                                    from 'antd'
import enUS                                                  from 'antd/lib/locale/en_US'
import { IntlProvider }                                      from 'react-intl'
import { generatePath, MemoryRouter, Params, Route, Routes } from 'react-router-dom'

type CustomRenderOptions = RenderOptions & {
  /**
   * Wrap with MemoryRouter when set
   */
  route?: boolean | {
    /**
     * Default to keys of params
     */
    path?: string
    params?: Params,
    /**
     * Whether to wrap <Routes> and initial <Route>
     * Default to true
     */
    wrapRoutes?: boolean
  }
}

/**
 * Custom render with ability to wrap with route and store
 */
function customRender (
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  let wrappedUI = ui
  if (options?.route) {
    const {
      wrapRoutes = true,
      ...route
    } = typeof options?.route === 'boolean' ? {} : options?.route

    const path = route.path ?? '/' + Object.keys(route.params ?? {})
      .map(key => `:${key}`)
      .join('/')
    const entry = generatePath(path, route.params ?? {})

    if (wrapRoutes) {
      wrappedUI = <Routes>
        <Route path={path} element={wrappedUI} />
      </Routes>
    }

    wrappedUI = <MemoryRouter initialEntries={[entry]} children={wrappedUI} />
  }
  wrappedUI = <IntlProvider locale={enUS.locale} children={wrappedUI} />
  wrappedUI = <ConfigProvider locale={enUS} children={wrappedUI} />
  return render(wrappedUI, options)
}

export * from '@testing-library/react'
export { customRender as render }
