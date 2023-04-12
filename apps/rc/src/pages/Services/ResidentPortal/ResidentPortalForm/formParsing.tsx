import { ResidentPortal } from "@acx-ui/rc/utils"


export interface CreateResidentPortalFormFields {
  id?: string;
  serviceName: string;
  textTitle: string;
  textSubtitle: string;
  textLogin: string;
  textAnnouncements: string;
  textHelp: string;
}
  
export function transferSaveDataToFormFields(data: ResidentPortal): CreateResidentPortalFormFields {
  const uiConfiguration = data.uiConfiguration && data.uiConfiguration.text ? {
    textTitle: data.uiConfiguration.text.title ? data.uiConfiguration.text.title : '',
    textSubtitle: data.uiConfiguration.text.subTitle ? data.uiConfiguration.text.subTitle : '',
    textLogin: data.uiConfiguration.text.loginText ? data.uiConfiguration.text.loginText : '',
    textAnnouncements: data.uiConfiguration.text.announcements ? 
      data.uiConfiguration.text.announcements : '',
    textHelp: data.uiConfiguration.text.helpText ? data.uiConfiguration.text.helpText : '',
  } : {
    textTitle: '',
    textSubtitle: '',
    textLogin: '',
    textAnnouncements: '',
    textHelp: ''
  }

  return {
    serviceName: data.name,
    ...uiConfiguration
  }
}

export function transferFormFieldsToSaveData (data: CreateResidentPortalFormFields): ResidentPortal {
  return {
    name: data.serviceName,
    uiConfiguration: {
      type: "uiConfiguration",
      text: {
        type:"text",
        title: data.textTitle,
        subTitle: data.textSubtitle,
        loginText: data.textLogin,
        announcements: data.textAnnouncements,
        helpText: data.textHelp
      }
    }
  }
}
