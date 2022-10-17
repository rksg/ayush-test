import { Network } from './index'

export interface Portal{
  id: string
  serviceName: string
  tags?: string[]
  network: PortalNetwork[]
  demo?: Demo
}
export interface PortalNetwork extends Network{
}
export interface Demo{
  color: string
  image: string
  logo: string
  welcomeText: string
  photo: string
  secondaryText: string
  termsCondition: string
  powerBy: string
  wifi4EU: string
  view: View
  comp: Comp
  language: Language
}
export interface View{

}
export interface Language{

}
export interface Comp{

}
export enum PortalViewEnum{
  ClickThrough = 'Click Through',
  GuestPassConnect = 'Guest Pass - Connect',
  GuestPassForgot = 'Guest Pass - Forgot password',
  SelfSignIn = 'Self Sign In - Connect',
  SelfSignInRegister = 'Self Sign In - Register/Confirm',
  HostApproval = 'Host Approval - Register/Confirm',
  ConnectionConfirmed = 'Connection confirmed',
  TermCondition = 'Terms & Conditions'
}
export enum PortalLanguageEnum{
  ChineseTraditional = 'Chinese (Traditional)',
  Czech = 'Czech',
  English = 'English',
  Finnish = 'Finnish',
  French = 'French',
  German = 'German',
  Greek = 'Greek',
  Hungarian = 'Hungarian',
  Italian = 'Italian',
  Japanese = 'Japanese',
  Norwegian = 'Norwegian',
  Polish = 'Polish',
  PortuguesePortugal = 'Portuguese (Portugal)',
  PortugueseBrazil = 'Portuguese (Brazil)',
  Romanian = 'Romanian',
  Slovak = 'Slovak',
  Spanish = 'Spanish',
  Swedish = 'Swedish',
  Turkish = 'Turkish'
}

export enum PortalComponentsEnum{
  Logo = 'Logo',
  WelcomeText = 'Welcome text',
  Photo = 'Photo',
  SecondaryText = 'Secondary text',
  TermsConditions = 'Terms & conditions',
  PoweredBy = 'Powered By',
  WiFi4EU = 'WiFi4EU Snippet'
}

export const defaultComDisplay = {
  Logo: true,
  WelcomeText: true,
  Photo: true,
  SecondaryText: true,
  TermsConditions: true,
  PoweredBy: true,
  WiFi4EU: true
}
