import { createContext } from 'react'

export interface NetworkFormContextType {
    settingStepTitle?: string;
    setSettingStepTitle: React.Dispatch<React.SetStateAction<string>>;
}
const NetworkFormContext = createContext({} as NetworkFormContextType)

export default NetworkFormContext