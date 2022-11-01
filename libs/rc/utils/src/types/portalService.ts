import { Network } from './index'

export interface Portal{
  id?: string
  serviceName: string
  tags?: string[]
  network: PortalNetwork[]
  demo: Demo
}
export interface PortalNetwork extends Network{
}
export interface Demo{
  backgroundColor: string
  backgroundImage: string
  logo?: string
  logoSize?: number
  welcomeText: string
  welcomeSize: number
  welcomeColor: string
  photo?: string
  photoSize?: number
  secondaryText: string
  secondarySize?: number
  secondaryColor?: string
  buttonColor?:string
  termsCondition: string
  poweredBackgroundColor:string
  poweredColor:string
  poweredSize:number
  poweredImg:string
  poweredImgSize:number
  wifi4EU: string
  componentDisplay: { [key:string]:boolean }
  displayLang: string
  alternativeLang: { [key:string]:boolean }
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
  TermsConditions: false,
  PoweredBy: true,
  WiFi4EU: false
}
export const defaultAlternativeLang = {
  ChineseTraditional: false,
  Czech: false,
  English: false,
  Finnish: false,
  French: false,
  German: false,
  Greek: false,
  Hungarian: false,
  Italian: false,
  Japanese: false,
  Norwegian: false,
  Polish: false,
  PortuguesePortugal: false,
  PortugueseBrazil: false,
  Romanian: false,
  Slovak: false,
  Spanish: false,
  Swedish: false,
  Turkish: false
}
