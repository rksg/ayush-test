import { Tabs } from '../../Tabs'

export function WithTabs () {
  return <>
    <Tabs>
      <Tabs.TabPane tab='Tab 1' key='tab1'>Tab 1 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 2' key='tab2' isBetaFeature>Tab 2 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 3' key='tab3'>Tab 3 Content</Tabs.TabPane>
    </Tabs>
    <br></br><br></br>
    <Tabs type='card'>
      <Tabs.TabPane tab='Tab 1' key='tab1'>Tab 1 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 2' key='tab2' isBetaFeature>Tab 2 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 3' key='tab3'>Tab 3 Content</Tabs.TabPane>
    </Tabs>
    <br></br><br></br>
    <Tabs type='third'>
      <Tabs.TabPane tab='Tab 1' key='tab1'>Tab 1 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 2' key='tab2' isBetaFeature>Tab 2 Content</Tabs.TabPane>
      <Tabs.TabPane tab='Tab 3' key='tab3'>Tab 3 Content</Tabs.TabPane>
    </Tabs>
  </>
}
