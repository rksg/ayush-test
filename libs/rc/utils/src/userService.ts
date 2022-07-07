/* eslint-disable no-console */
const SEP_CHAR = '$'

export const getUserSettingsFromDict = (userSettings: { [key: string]: any }, key: string) => {
  const value = getDeepProp(userSettings, key)
  return value
}

const getDeepProp = (obj: { [key: string]: any }, props:string) => {
  return props.split(SEP_CHAR).reduce((acc, p) => {
    // if the accumulator is something
    // then lookup the next nested property
    // otherwise return null
    if (acc == null) {
      return null
    }
    return acc[p]
  }, obj) // the initial accumulator is the object
}
