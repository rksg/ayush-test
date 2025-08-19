import userEvent        from '@testing-library/user-event'
import { FormInstance } from 'antd'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltForm } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./OltBasicForm', () => ({
  OltBasicForm: (props: {
    form: FormInstance,
    onFinish: jest.Mock,
    data?: unknown,
    editMode?: boolean
  }) =>
    <div data-testid='OltBasicForm'>
      <button onClick={() => props.onFinish({ test: 'data' })}>
        {props.editMode ? 'Apply' : 'Add'}
      </button>
    </div>
}))

describe('AddOlt', () => {
  const params = { tenantId: 'tenant-id', action: 'add' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <OltForm />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByTestId('OltBasicForm')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })
})

describe('EditOlt', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', action: 'edit' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <OltForm />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByTestId('OltBasicForm')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })
})
