import { ReactElement } from 'react'

import { render, RenderOptions }                             from '@testing-library/react'
import { generatePath, MemoryRouter, Params, Route, Routes } from 'react-router-dom'

type CustomRenderOptions = RenderOptions & {
  /**
   * Wrap with MemoryRouter when set
   */
  route?: {
    path: string
    params?: Params
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
    const entry = generatePath(options.route.path, options.route.params ?? {})
    wrappedUI = <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={options.route.path} element={wrappedUI} />
      </Routes>
    </MemoryRouter>
  }
  return render(wrappedUI, options)
}

export * from '@testing-library/react'
export { customRender as render }
