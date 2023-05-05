import { ResidentPortal } from '@acx-ui/rc/utils'


export interface CreateResidentPortalFormFields {
  id?: string;
  serviceName: string;
  textTitle: string;
  textSubtitle: string;
  textLogin: string;
  textAnnouncements: string;
  textHelp: string;
  colorMain: string;
  colorAccent: string;
  colorSeparator: string;
  colorText: string;
  fileLogo: any;
  fileFavicon: any;
}

export function transferSaveDataToFormFields (data: ResidentPortal):CreateResidentPortalFormFields {
  const uiConfiguration = data.uiConfiguration && data.uiConfiguration.text ? {
    textTitle: data.uiConfiguration.text.title ? data.uiConfiguration.text.title : '',
    textSubtitle: data.uiConfiguration.text.subTitle ? data.uiConfiguration.text.subTitle : '',
    textLogin: data.uiConfiguration.text.loginText ? data.uiConfiguration.text.loginText : '',
    textAnnouncements: data.uiConfiguration.text.announcements ?
      data.uiConfiguration.text.announcements : '',
    textHelp: data.uiConfiguration.text.helpText ? data.uiConfiguration.text.helpText : '',

    colorMain: data.uiConfiguration?.color?.mainColor ? data.uiConfiguration.color.mainColor : '',
    colorAccent: data.uiConfiguration?.color?.accentColor ? 
      data.uiConfiguration.color.accentColor : '',
    colorSeparator: data.uiConfiguration?.color?.separatorColor ? 
      data.uiConfiguration.color.separatorColor : '',
    colorText: data.uiConfiguration?.color?.textColor ? data.uiConfiguration.color.textColor : '',

    fileLogo: undefined,
    fileFavicon: undefined
  } : {
    textTitle: '',
    textSubtitle: '',
    textLogin: '',
    textAnnouncements: '',
    textHelp: '',

    colorMain: '',
    colorAccent: '',
    colorSeparator: '',
    colorText: '',

    fileLogo: undefined,
    fileFavicon: undefined
  }

  return {
    id: data.id,
    serviceName: data.name,
    ...uiConfiguration
  }
}

export function transferFormFieldsToSaveData (data: CreateResidentPortalFormFields):ResidentPortal {

  return {
    name: data.serviceName,
    uiConfiguration: {
      type: 'uiConfiguration',
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
        logoFileName: data.fileLogo?.file ? data.fileLogo.file.name : undefined,
        favIconFileName: data.fileFavicon?.file ? data.fileFavicon.file.name : undefined
      }
    }
  }
}
