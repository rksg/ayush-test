
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { Tabs, TabsType } from '.'

describe('Tabs', () => {
  function renderTab (type?: TabsType, stickyTop?: boolean) {
    return <Tabs type={type} stickyTop={stickyTop}>
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
      render(renderTab(type, false))
      expect(screen.getAllByRole('tab')).toHaveLength(2)
    })
  })

  it('render with stickyTop', async () => {
    render(renderTab('card', true))
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)

    fireEvent.click(tabs[1])

    const content = await screen.findByText('Tab 2 Content')
    expect(content).toBeVisible()
  })
})
