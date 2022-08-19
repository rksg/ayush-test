import { UserSettings } from './types/user'

const SEP_CHAR = '$'

export const getUserSettingsFromDict = (userSettings: UserSettings, key: string) => {
  const value = getDeepProp(userSettings, key)
  return value
}

const getDeepProp = (obj: UserSettings, props: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return props.split(SEP_CHAR).reduce((acc: any, p) => {
    // if the accumulator is something
    // then lookup the next nested property
    // otherwise return null
    if (acc == null) {
      return null
    }
    return acc[p]
  }, obj) // the initial accumulator is the object
}
