import { createContext } from 'react'

export interface MdnsProxyFormContextType {
  editMode: boolean
}
const MdnsProxyFormContext = createContext({} as MdnsProxyFormContextType)

export default MdnsProxyFormContext

