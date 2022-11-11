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

export interface PortalDetailInstances{
  id?: string,
  network: Network,
  venues: number,
  health: number,
  abandonmentRate: number,
  clients: number,
  clientsPortal: number
}
