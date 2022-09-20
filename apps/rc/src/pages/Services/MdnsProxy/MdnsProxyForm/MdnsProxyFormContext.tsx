import { createContext } from 'react'

import { MdnsProxyFormData } from '@acx-ui/rc/utils'


export interface MdnsProxyFormContextType {
  editMode: boolean;
  defaultData?: MdnsProxyFormData;
  currentData: MdnsProxyFormData;
}
const MdnsProxyFormContext = createContext({} as MdnsProxyFormContextType)

export default MdnsProxyFormContext

