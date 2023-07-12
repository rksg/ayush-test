import userEvent from '@testing-library/user-event'

import {
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl,
  store
} from '@acx-ui/store'
import { mockGraphqlQuery, screen } from '@acx-ui/test-utils'

import { renderForm }            from '../../__tests__/fixtures'
import { serviceGuardSpecNames } from '../../__tests__/fixtures'

import { TestName } from './TestName'

const { click, type } = userEvent

describe('TestName', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('invalidate field if empty', async () => {
    renderForm(<TestName />)

    await click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter')
  })

  it('invalidate field when name exists', async () => {
    mockGraphqlQuery(apiUrl, 'ServiceGuardSpecNames', { data: serviceGuardSpecNames })

    renderForm(<TestName />)

    const value = serviceGuardSpecNames.allServiceGuardSpecs[0].name
    await type(screen.getByRole('textbox'), value)
    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('name exist')
  })

  it('valid when value = initialValue in editMode', async () => {
    mockGraphqlQuery(apiUrl, 'ServiceGuardSpecNames', { data: serviceGuardSpecNames })

    const name = serviceGuardSpecNames.allServiceGuardSpecs[0].name
    renderForm(<TestName />, {
      editMode: true,
      initialValues: { name }
    })

    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByTestId('form-values')).toHaveTextContent(name)
  })
})
