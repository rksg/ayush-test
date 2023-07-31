import userEvent from '@testing-library/user-event'

import {
  videoCallQoeApi as api,
  store,
  r1VideoCallQoeURL
} from '@acx-ui/store'
import { mockGraphqlQuery, screen } from '@acx-ui/test-utils'

import { renderForm }         from '../../../ServiceGuard/__tests__/fixtures'
import { getAllCallQoeTests } from '../../__tests__/fixtures'

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
    mockGraphqlQuery(r1VideoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })

    renderForm(<TestName />)

    await type(screen.getByRole('textbox'), 'Test call')
    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('name exist')
  })

})
