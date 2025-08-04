import { useContext } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'

import { MemoryRouter, Route, Routes } from '@acx-ui/react-router-dom'

import { ConfigTemplateContext }           from './ConfigTemplateContext'
import { LayoutWithConfigTemplateContext } from './ConfigTemplateRouteLayout'

describe('LayoutWithConfigTemplateContext', () => {
  const mockedSaveFn = jest.fn()

  beforeEach(() => {
    mockedSaveFn.mockClear()
  })

  it('should provide correct context values', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LayoutWithConfigTemplateContext />}>
            <Route
              path='/'
              element={
                <TestLayoutWithConfigTemplateContextConsumer
                  mockedFn={mockedSaveFn}
                  targetId='template123'
                />
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('isTemplate: true')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(mockedSaveFn).toHaveBeenCalledWith('template123')
  })
})

// eslint-disable-next-line max-len
export function TestLayoutWithConfigTemplateContextConsumer (props: { mockedFn: jest.Mock, targetId: string }) {
  // eslint-disable-next-line max-len
  const { isTemplate, setSaveEnforcementConfigFn, saveEnforcementConfig } = useContext(ConfigTemplateContext)

  setSaveEnforcementConfigFn?.((templateId: string) => {
    props.mockedFn(templateId)
    return Promise.resolve()
  })

  const handleClick = async () => {
    await (saveEnforcementConfig?.(props.targetId))
  }

  return (
    <div>
      <p>isTemplate: {isTemplate ? 'true' : 'false'}</p>
      <button onClick={handleClick}>Trigger Save</button>
    </div>
  )
}
