
import { ResidentPortal } from '@acx-ui/rc/utils'

import { mockedCreateFormData, mockedResidentPortal } from '../__tests__/fixtures'

import { CreateResidentPortalFormFields,
  transferFormFieldsToSaveData,
  transferSaveDataToFormFields } from './formParsing'

describe('ResidentPortal parser', () => {
  it('should transfer form fields to the ResidentPortal saved data', () => {

    const saveData: ResidentPortal =
      transferFormFieldsToSaveData(mockedCreateFormData)

    expect(saveData.name).toBe(mockedCreateFormData.serviceName)
    expect(saveData.uiConfiguration?.text.title).toBe(mockedCreateFormData.textTitle)
    expect(saveData.uiConfiguration?.text.subTitle).toBe(mockedCreateFormData.textSubtitle)
    expect(saveData.uiConfiguration?.text.loginText).toBe(mockedCreateFormData.textLogin)
    expect(saveData.uiConfiguration?.text.announcements)
      .toBe(mockedCreateFormData.textAnnouncements)
    expect(saveData.uiConfiguration?.text.helpText).toBe(mockedCreateFormData.textHelp)
    expect(saveData.uiConfiguration?.access?.tenantSetDpsk).toBe(mockedCreateFormData.tenantSetDpsk)
    expect(saveData.uiConfiguration?.color?.mainColor).toBe(mockedCreateFormData.colorMain)
    expect(saveData.uiConfiguration?.color?.accentColor).toBe(mockedCreateFormData.colorAccent)
    expect(saveData.uiConfiguration?.color?.separatorColor)
      .toBe(mockedCreateFormData.colorSeparator)
    expect(saveData.uiConfiguration?.color?.textColor).toBe(mockedCreateFormData.colorText)
    expect(saveData.uiConfiguration?.files?.logoFileName)
      .toBe(mockedCreateFormData.fileLogo.file?.name)
    expect(saveData.uiConfiguration?.files?.favIconFileName)
      .toBe(mockedCreateFormData.fileFavicon.file?.name)
  })

  it('should remove filename when file is removed', () => {
    const formDataRemovedFiles: CreateResidentPortalFormFields = {
      serviceName: 'New Resident Portal',
      textTitle: 'Welcome',
      textSubtitle: 'This is a Mocked Portal',
      textLogin: 'Login Please',
      textAnnouncements: 'Announcing a Mocked Portal',
      textHelp: 'This is a test.',
      tenantSetDpsk: true,
      colorMain: '',
      colorAccent: '',
      colorSeparator: '',
      colorText: '',
      fileLogo: {
        file: new File(['testLogo'], 'testLogo.png', { type: 'image/png' }),
        isRemoved: true },
      fileFavicon: {
        file: new File(['testFavicon'], 'testFavicon.png', { type: 'image/png' }),
        isRemoved: true }
    }

    const saveData: ResidentPortal =
      transferFormFieldsToSaveData(formDataRemovedFiles)

    expect(saveData.name).toBe(formDataRemovedFiles.serviceName)
    expect(saveData.uiConfiguration?.text.title).toBe(formDataRemovedFiles.textTitle)
    expect(saveData.uiConfiguration?.text.subTitle).toBe(formDataRemovedFiles.textSubtitle)
    expect(saveData.uiConfiguration?.text.loginText).toBe(formDataRemovedFiles.textLogin)
    expect(saveData.uiConfiguration?.text.announcements)
      .toBe(formDataRemovedFiles.textAnnouncements)
    expect(saveData.uiConfiguration?.text.helpText).toBe(formDataRemovedFiles.textHelp)
    expect(saveData.uiConfiguration?.color?.mainColor).toBe(formDataRemovedFiles.colorMain)
    expect(saveData.uiConfiguration?.color?.accentColor).toBe(formDataRemovedFiles.colorAccent)
    expect(saveData.uiConfiguration?.color?.separatorColor)
      .toBe(formDataRemovedFiles.colorSeparator)
    expect(saveData.uiConfiguration?.color?.textColor).toBe(formDataRemovedFiles.colorText)
    expect(saveData.uiConfiguration?.files?.logoFileName).toBe('')
    expect(saveData.uiConfiguration?.files?.favIconFileName).toBe('')
  })

  it('should not change filename when file is unchanged', () => {
    const formDataRemovedFiles: CreateResidentPortalFormFields = {
      serviceName: 'New Resident Portal',
      textTitle: 'Welcome',
      textSubtitle: 'This is a Mocked Portal',
      textLogin: 'Login Please',
      textAnnouncements: 'Announcing a Mocked Portal',
      textHelp: 'This is a test.',
      tenantSetDpsk: true,
      colorMain: '',
      colorAccent: '',
      colorSeparator: '',
      colorText: '',
      fileLogo: { file: undefined },
      fileFavicon: { file: undefined }
    }

    const saveData: ResidentPortal =
      transferFormFieldsToSaveData(formDataRemovedFiles)

    expect(saveData.name).toBe(formDataRemovedFiles.serviceName)
    expect(saveData.uiConfiguration?.text.title).toBe(formDataRemovedFiles.textTitle)
    expect(saveData.uiConfiguration?.text.subTitle).toBe(formDataRemovedFiles.textSubtitle)
    expect(saveData.uiConfiguration?.text.loginText).toBe(formDataRemovedFiles.textLogin)
    expect(saveData.uiConfiguration?.text.announcements)
      .toBe(formDataRemovedFiles.textAnnouncements)
    expect(saveData.uiConfiguration?.text.helpText).toBe(formDataRemovedFiles.textHelp)
    expect(saveData.uiConfiguration?.color?.mainColor).toBe(formDataRemovedFiles.colorMain)
    expect(saveData.uiConfiguration?.color?.accentColor).toBe(formDataRemovedFiles.colorAccent)
    expect(saveData.uiConfiguration?.color?.separatorColor)
      .toBe(formDataRemovedFiles.colorSeparator)
    expect(saveData.uiConfiguration?.color?.textColor).toBe(formDataRemovedFiles.colorText)
    expect(saveData.uiConfiguration?.files?.logoFileName).toBeUndefined()
    expect(saveData.uiConfiguration?.files?.favIconFileName).toBeUndefined()
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
    expect(formData.tenantSetDpsk).toBe(mockedResidentPortal.uiConfiguration.access.tenantSetDpsk)
    expect(formData.colorMain).toBe(mockedResidentPortal.uiConfiguration.color.mainColor)
    expect(formData.colorAccent).toBe(mockedResidentPortal.uiConfiguration.color.accentColor)
    expect(formData.colorSeparator).toBe(mockedResidentPortal.uiConfiguration.color.separatorColor)
    expect(formData.colorText).toBe(mockedResidentPortal.uiConfiguration.color.textColor)
    expect(formData.fileLogo.file?.name).toBeUndefined()
    expect(formData.fileFavicon.file?.name).toBeUndefined()
  })

  it('should transfer empty strings to form fields when values are undefined', () => {
    const undefinedResidentPortal : ResidentPortal = {
      id: '9080bd9a-81f6-4321-9ff9-344ed4c5e1d6',
      name: 'Mock Resident Portal',
      uiConfiguration: {
        type: 'uiConfiguration',
        text: {
          loginText: '',
          title: '',
          subTitle: '',
          announcements: '',
          helpText: ''
        },
        color: {
          mainColor: '',
          accentColor: '',
          separatorColor: '',
          textColor: ''
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
    expect(formData.tenantSetDpsk).toBeFalsy()
    expect(formData.colorMain).toBe('')
    expect(formData.colorAccent).toBe('')
    expect(formData.colorSeparator).toBe('')
    expect(formData.colorText).toBe('')
  })

  it('should transfer empty strings to form fields when uiConfiguration is undefined', () => {
    const undefinedResidentPortal : ResidentPortal = {
      id: '9080bd9a-81f6-4321-9ff9-344ed4c5e1d6',
      name: 'Mock Resident Portal',
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
    expect(formData.tenantSetDpsk).toBeFalsy()
    expect(formData.colorMain).toBe('')
    expect(formData.colorAccent).toBe('')
    expect(formData.colorSeparator).toBe('')
    expect(formData.colorText).toBe('')
    expect(formData.fileLogo.file?.name).toBeUndefined()
    expect(formData.fileFavicon.file?.name).toBeUndefined()
  })

})
