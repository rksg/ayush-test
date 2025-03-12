import { Tabs } from '@acx-ui/components'

import { IntentAIRRMGraph } from './RRMGraph'

export const TabGraph = (
  { width, fullOptimization }: { width?: number, fullOptimization?: boolean }
) => {
  return <Tabs>
    <Tabs.TabPane tab='Interfering Links' key='interfering-links'>
      <IntentAIRRMGraph width={width} isFullOptimization={fullOptimization} />
    </Tabs.TabPane>
  </Tabs>
}
