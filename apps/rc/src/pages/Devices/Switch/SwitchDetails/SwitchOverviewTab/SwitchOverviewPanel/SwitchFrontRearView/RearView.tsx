import { SwitchModelInfo, SwitchRearViewUI } from '@acx-ui/rc/utils';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import * as UI             from './styledComponents'

export function RearView (props:{
  slot: SwitchRearViewUI
  switchModelInfo: SwitchModelInfo
}) {
  const { $t } = useIntl()
  // const { slot, switchModelInfo } = props
  
  return <>
   <RearElement icon='P' />
   <RearElement icon='F' />
  </>
}

function RearElement (props:{
  icon: 'P' | 'F'
}) {

  return <UI.RearViewWrapper>
    <UI.Rear rearColor='green'></UI.Rear>
  </UI.RearViewWrapper>
} 