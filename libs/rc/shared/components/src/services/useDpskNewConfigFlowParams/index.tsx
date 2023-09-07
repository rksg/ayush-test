import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { DpskNewConfigFlowParamsValue } from '@acx-ui/rc/services'

export function useDpskNewConfigFlowParams (): { isNewConfigFlow: DpskNewConfigFlowParamsValue } {
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)

  return {
    isNewConfigFlow: isNewConfigFlow ? 'y' : 'n'
  }
}
