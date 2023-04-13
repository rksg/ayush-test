
import { CreateResidentPortalFormFields, transferFormFieldsToSaveData, transferSaveDataToFormFields } from './formParsing'

import { mockedCreateFormData, mockedResidentPortal } from './__tests__/fixtures'
import { ResidentPortal } from '@acx-ui/rc/utils'

describe('ResidentPortal parser', () => {
  it('should transfer form fields to the ResidentPortal saved data', () => {
    
    const saveData: ResidentPortal = 
      transferFormFieldsToSaveData(mockedCreateFormData)

    expect(saveData.name).toBe(mockedCreateFormData.serviceName)
    expect(saveData.uiConfiguration?.text.title).toBe(mockedCreateFormData.textTitle)
    expect(saveData.uiConfiguration?.text.subTitle).toBe(mockedCreateFormData.textSubtitle)
    expect(saveData.uiConfiguration?.text.loginText).toBe(mockedCreateFormData.textLogin)
    expect(saveData.uiConfiguration?.text.announcements).toBe(mockedCreateFormData.textAnnouncements)
    expect(saveData.uiConfiguration?.text.helpText).toBe(mockedCreateFormData.textHelp)
  })

  it('should transfer the ResidentPortal data to form fields', () => {
    const formData: CreateResidentPortalFormFields = 
      transferSaveDataToFormFields(mockedResidentPortal as ResidentPortal)

    expect(mockedResidentPortal.name).toBe(formData.serviceName)
    expect(formData.textTitle).toBe(mockedResidentPortal.uiConfiguration.text.title)
    expect(formData.textSubtitle).toBe(mockedResidentPortal.uiConfiguration.text.subTitle)
    expect(formData.textLogin).toBe(mockedResidentPortal.uiConfiguration.text.loginText)
    expect(formData.textAnnouncements).toBe(mockedResidentPortal.uiConfiguration.text.announcements)
    expect(formData.textHelp).toBe(mockedResidentPortal.uiConfiguration.text.helpText)
  })

  it('should transfer empty strings to form fields when values are undefined', () => {
    const undefinedResidentPortal : ResidentPortal = {
      id: "9080bd9a-81f6-4321-9ff9-344ed4c5e1d6",
      name: "Mock Resident Portal",
      uiConfiguration: {
        type: "uiConfiguration",
        text: {
          loginText: '',
          title: '',
          subTitle: '',
          announcements: '',
          helpText: ''
        }
      }
    }

    const formData: CreateResidentPortalFormFields = 
      transferSaveDataToFormFields(undefinedResidentPortal)

    expect(formData.serviceName).toBe(undefinedResidentPortal.name)
    expect(formData.textTitle).toBe('')
    expect(formData.textSubtitle).toBe('')
    expect(formData.textLogin).toBe('')
    expect(formData.textAnnouncements).toBe('')
    expect(formData.textHelp).toBe('')
  })

  it('should transfer empty strings to form fields when uiConfiguration is undefined', () => {
    const undefinedResidentPortal : ResidentPortal = {
      id: "9080bd9a-81f6-4321-9ff9-344ed4c5e1d6",
      name: "Mock Resident Portal",
      uiConfiguration: undefined
    }

    const formData: CreateResidentPortalFormFields = 
      transferSaveDataToFormFields(undefinedResidentPortal)

      expect(formData.serviceName).toBe(undefinedResidentPortal.name)
      expect(formData.textTitle).toBe('')
      expect(formData.textSubtitle).toBe('')
      expect(formData.textLogin).toBe('')
      expect(formData.textAnnouncements).toBe('')
      expect(formData.textHelp).toBe('')
  })

})
