
import { render, screen } from '@acx-ui/test-utils'

import { Tabs, TabsType } from '.'

describe('Tabs', () => {
  function renderTab (type?: TabsType) {
    return <Tabs type={type}>
      <Tabs.TabPane tab='Tab 1' key='tab1'>Tab 1 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 2' key='tab2'>Tab 2 Content</Tabs.TabPane>
    </Tabs>
  }
  const types: TabsType[] = ['line', 'card', 'third']
  it('render default as line', async () => {
    render(renderTab())
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
  types.forEach(type => {
    it(`render type = ${type}`, async () => {
      render(renderTab(type))
      expect(screen.getAllByRole('tab')).toHaveLength(2)
    })
  })
})
