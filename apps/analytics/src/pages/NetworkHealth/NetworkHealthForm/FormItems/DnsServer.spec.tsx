import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm, withinField } from '../../__tests__/fixtures'

import { DnsServer } from './DnsServer'

const { clear, click, type } = userEvent

describe('DnsServer', () => {
  it('handles Default', async () => {
    renderForm(<DnsServer />, {
      initialValues: { isDnsServerCustom: false }
    })

    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked()

    await click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByTestId('form-values')).toHaveTextContent('false')
  })

  it('handles Custom', async () => {
    renderForm(<DnsServer />, {
      initialValues: { isDnsServerCustom: true }
    })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const input = withinField().getByRole('textbox')

    expect(input).toBeVisible()
    await click(submit)

    const error1 = await screen.findByRole('alert', {
      name: (_, el) => el.textContent === 'Please enter DNS Server'
    })
    expect(error1).toBeVisible()

    await type(input, '123')
    await click(submit)

    const error2 = await screen.findByRole('alert', {
      name: (_, el) => el.textContent === 'Please enter a valid IP address'
    })
    expect(error2).toBeVisible()

    await clear(input)
    await type(input, '10.10.10.10')
    await click(submit)

    await screen.findByRole('heading', { name: 'Valid' })
    expect(screen.getByTestId('form-values')).toHaveTextContent('10.10.10.10')
  })

  it('resets dnsServer when switch from Custom > Default', async () => {
    renderForm(<DnsServer />, {
      initialValues: {
        isDnsServerCustom: true,
        configs: [{ dnsServer: '10.10.10.10' }]
      }
    })

    await click(screen.getByRole('radio', { name: 'Default' }))
    await click(screen.getByRole('button', { name: 'Submit' }))

    const values = await screen.findByTestId('form-values')
    expect(values).not.toHaveTextContent('10.10.10.10')
    expect(values).toHaveTextContent('false')
  })
})

describe('DnsServer.FieldSummary', () => {
  it('renders for Default', async () => {
    const { container } = renderForm(<DnsServer.FieldSummary />, {
      initialValues: {
        isDnsServerCustom: false
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent('Default')
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-form-item-hidden').length).toBe(1)
  })

  it('hidden if selected auth method not require this field', async () => {
    const value = '10.10.10.10'
    const { container } = renderForm(<DnsServer.FieldSummary />, {
      initialValues: {
        isDnsServerCustom: true,
        configs: [{ dnsServer: value }]
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent(value)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-form-item-hidden').length).toBe(1)
  })
})
