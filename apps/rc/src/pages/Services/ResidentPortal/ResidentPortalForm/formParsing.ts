import { ResidentPortal } from '@acx-ui/rc/utils'

import { ResidentPortalImageValue } from './ResidentPortalImageUpload'


export interface CreateResidentPortalFormFields {
  id?: string;
  serviceName: string;
  tenantSetDpsk: boolean;
  textTitle: string;
  textSubtitle: string;
  textLogin: string;
  textAnnouncements: string;
  textHelp: string;
  colorMain: string;
  colorAccent: string;
  colorSeparator: string;
  colorText: string;
  fileLogo: ResidentPortalImageValue;
  fileFavicon: ResidentPortalImageValue;
}

export function transferSaveDataToFormFields (data: ResidentPortal):CreateResidentPortalFormFields {
  const formValues = {
    textTitle: '',
    textSubtitle: '',
    textLogin: '',
    textAnnouncements: '',
    textHelp: '',

    tenantSetDpsk: false,

    colorMain: '',
    colorAccent: '',
    colorSeparator: '',
    colorText: '',

    fileLogo: { file: undefined },
    fileFavicon: { file: undefined }
  }

  formValues.tenantSetDpsk = data.uiConfiguration?.access?.tenantSetDpsk ?? false

  if(data.uiConfiguration?.text) {
    formValues.textTitle = data.uiConfiguration.text.title
    formValues.textSubtitle = data.uiConfiguration.text.subTitle
    formValues.textLogin = data.uiConfiguration.text.loginText
    formValues.textAnnouncements = data.uiConfiguration.text.announcements
    formValues.textHelp = data.uiConfiguration.text.helpText
  }

  if(data.uiConfiguration?.color) {
    formValues.colorMain = data.uiConfiguration.color.mainColor
    formValues.colorAccent = data.uiConfiguration.color.accentColor
    formValues.colorSeparator = data.uiConfiguration.color.separatorColor
    formValues.colorText = data.uiConfiguration.color.textColor
  }

  return {
    id: data.id,
    serviceName: data.name,
    ...formValues
  }
}

export function transferFormFieldsToSaveData (data: CreateResidentPortalFormFields):ResidentPortal {

  return {
    name: data.serviceName,
    uiConfiguration: {
      type: 'uiConfiguration',
      access: {
        tenantSetDpsk: data.tenantSetDpsk
      },
      text: {
        type: 'text',
        title: data.textTitle,
        subTitle: data.textSubtitle,
        loginText: data.textLogin,
        announcements: data.textAnnouncements,
        helpText: data.textHelp
      },
      color: {
        mainColor: data.colorMain,
        accentColor: data.colorAccent,
        separatorColor: data.colorSeparator,
        textColor: data.colorText
      },
      files: {
        logoFileName: data.fileLogo?.file && !data.fileLogo.isRemoved ?
          data.fileLogo.file.name : (data.fileLogo?.isRemoved ? '' : undefined),
        favIconFileName: data.fileFavicon?.file && !data.fileLogo.isRemoved ?
          data.fileFavicon.file.name : (data.fileFavicon?.isRemoved ? '' : undefined)
      }
    }
  }
}
