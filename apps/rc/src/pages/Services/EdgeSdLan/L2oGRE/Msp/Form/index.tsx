import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { EdgeSdLanContextProvider }          from '../../Form/EdgeSdLanContextProvider'

import { MspEdgeSdLanContextProvider } from './MspEdgeSdLanContextProvider'

export const MspEdgeSdLanFormContainer = (props: EdgeSdLanFormProps) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <MspEdgeSdLanContextProvider>
      <EdgeSdLanForm {...props}/>
    </MspEdgeSdLanContextProvider>
  </EdgeSdLanContextProvider>
}