import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { EdgeSdLanContextProvider }          from '../../Form/EdgeSdLanContextProvider'

import { EdgeMspSdLanContextProvider } from './EdgeMspSdLanContextProvider'

export const EdgeSdLanFormMspContainer = (props: EdgeSdLanFormProps) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <EdgeMspSdLanContextProvider>
      <EdgeSdLanForm {...props}/>
    </EdgeMspSdLanContextProvider>
  </EdgeSdLanContextProvider>
}