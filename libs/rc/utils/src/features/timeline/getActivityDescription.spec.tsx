
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
  it("handles ' in template", async () => {
    const template = getActivityDescription("A '@@value' updated", [
      { name: 'value', value: 'record' }
    ])

    render(template)

    expect(document.body.textContent).toEqual("A 'record' updated")
  })
})
