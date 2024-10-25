import {
  mockClusterSubInterfaceSettings,
  mockSubInterfaceSettingsFormType
} from '../__tests__/fixtures'

import { transformFromApiToFormData } from './utils'

describe('Type transformation', () => {

  it('transformFromApiToFormData', () => {
    const result = transformFromApiToFormData(mockClusterSubInterfaceSettings)
    expect(result).toEqual(mockSubInterfaceSettingsFormType)
  })

  it('transformFromFormDataToApi', () => {
    const result = transformFromApiToFormData(mockClusterSubInterfaceSettings)
    expect(result).toEqual(mockSubInterfaceSettingsFormType)
  })
})
