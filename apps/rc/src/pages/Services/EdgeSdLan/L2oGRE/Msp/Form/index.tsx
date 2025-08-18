import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { EdgeSdLanContextProvider }          from '../../Form/EdgeSdLanContextProvider'
import { MspEdgeSdLanFormType }              from '../../shared/type'

import { MspEdgeSdLanContextProvider } from './MspEdgeSdLanContextProvider'

export const MspEdgeSdLanFormContainer = <T extends MspEdgeSdLanFormType>(
  props: EdgeSdLanFormProps<T>
) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <MspEdgeSdLanContextProvider>
      <EdgeSdLanForm {...props}/>
    </MspEdgeSdLanContextProvider>
  </EdgeSdLanContextProvider>
}