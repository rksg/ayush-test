import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'

import { IPDomainField } from './IPDomainField'

const field = <IPDomainField
  name='pingAddress'
  label='Ping Destination Address'
/>

const { click, type, clear } = userEvent

describe('PingDestinationAddress', () => {
  it('renders field', async () => {
    renderForm(field, {})

    const input = screen.getByRole('textbox')
    const submit = screen.getByRole('button', { name: 'Submit' })

    await click(submit)
    expect(await screen.findByRole('heading', { name: 'Valid' })).toBeVisible()

    await clear(input)
    await type(input, 'example.com')
    await click(submit)

    expect(await screen.findByRole('heading', { name: 'Valid' })).toBeVisible()
    expect(screen.getByTestId('form-values')).toHaveTextContent('example.com')

    await clear(input)
    await type(input, '10.10.10.10')
    await click(submit)

    expect(await screen.findByRole('heading', { name: 'Valid' })).toBeVisible()
    expect(screen.getByTestId('form-values')).toHaveTextContent('10.10.10.10')
  })

  it('invalidate field when valie exceed 127 chars', async () => {
    renderForm(field, {})

    const input = screen.getByRole('textbox')
    const submit = screen.getByRole('button', { name: 'Submit' })

    await type(input, '1'.repeat(128))
    await click(submit)

    expect(await screen.findByRole('alert', {
      name: (_, el) => el.textContent?.includes('127') || false
    })).toBeVisible()
  })

  it('invalidate field when value is not IP address/domain', async () => {
    renderForm(field, {})

    const error = 'Please enter a valid IP address or domain'
    const input = screen.getByRole('textbox')
    const submit = screen.getByRole('button', { name: 'Submit' })

    await clear(input)
    await type(input, '100')
    await click(submit)

    expect(await screen.findByRole('alert', {
      name: (_, el) => el.textContent === error
    })).toBeVisible()

    await clear(input)
    await type(input, 'example')
    await click(submit)

    expect(await screen.findByRole('alert', {
      name: (_, el) => el.textContent === error
    })).toBeVisible()
  })
})
