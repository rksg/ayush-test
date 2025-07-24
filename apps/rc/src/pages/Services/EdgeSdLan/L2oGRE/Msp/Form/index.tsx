import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { EdgeSdLanContextProvider }          from '../../Form/EdgeSdLanContextProvider'

export const EdgeSdLanFormMspContainer = (props: EdgeSdLanFormProps) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <EdgeSdLanForm {...props}/>
  </EdgeSdLanContextProvider>
}