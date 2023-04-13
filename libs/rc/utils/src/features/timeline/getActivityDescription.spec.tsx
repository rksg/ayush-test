
import { render, screen } from '@acx-ui/test-utils'

import { getActivityDescription } from './getActivityDescription'

describe('getActivityDescription', () => {
  it('convert template to expected element', async () => {
    const template = getActivityDescription('A @@value updated', [
      { name: 'value', value: 'record' }
    ])

    render(template)

    expect((await screen.findByText('record')).nodeName).toEqual('B')
    expect(document.body.textContent).toEqual('A record updated')
  })
  it('handles reserved keys of formatjs', async () => {
    const template = getActivityDescription("A '@@value' {@@value} <@@value> updated", [
      { name: 'value', value: 'record' }
    ])

    render(template)

    expect(document.body.textContent).toEqual("A 'record' {record} <record> updated")
  })
})
