import { RcFile } from 'antd/lib/upload'

import { FILTER }  from '../../useTableQuery'
import { Network } from '../network'

export interface Portal{
  id?: string
  serviceName: string
  tags?: string[]
  network: PortalNetwork[]
  content: Demo,
  networkIds?: string[],
  logoFile?: RcFile,
  bgFile?: RcFile,
  photoFile?: RcFile,
  poweredFile?: RcFile
}
export interface PortalNetwork extends Network{
}
export interface Demo{
  bgColor: string
  bgImage: string
  logo?: string
  logoRatio?: number
  welcomeText: string | undefined
  welcomeSize: number
  welcomeColor: string
  photo?: string
  photoRatio?: number
  secondaryText: string | undefined
  secondarySize?: number
  secondaryColor?: string
  buttonColor?:string
  termsCondition: string
  poweredBgColor:string
  poweredColor:string
  poweredSize:number
  poweredImg:string
  poweredImgRatio:number
  wifi4EUNetworkId: string
  componentDisplay: { [key:string]:boolean }
  displayLangCode: string
  alternativeLangCode?: string[]
  alternativeLang: { [key:string]:boolean }
}
export const defaultComDisplay = {
  logo: true,
  welcome: true,
  photo: true,
  secondaryText: true,
  termsConditions: false,
  poweredBy: true,
  wifi4eu: false
}
export const defaultAlternativeLang = {
  zh_TW: false,
  cs: false,
  en: false,
  fi: false,
  fr: false,
  de: false,
  el: false,
  hu: false,
  it: false,
  ja: false,
  no: false,
  pl: false,
  pt_PT: false,
  pt_BR: false,
  ro: false,
  sk: false,
  es: false,
  sv: false,
  tr: false
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

export interface PortalTablePayload{
  defaultPageSize: number,
  total: number,
  page: number,
  pageSize: number,
  searchString?: string,
  searchTargetFields?: string[],
  sortField: string,
  sortOrder: string,
  filters: FILTER,
}
