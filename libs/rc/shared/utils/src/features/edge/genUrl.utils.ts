import { Params, generatePath } from 'react-router-dom'

export enum CommonCategory {
  Device = 'devices',
  Service = 'service',
  Policy = 'policy'
}

export enum Device {
  Edge = 'edge',
  EdgeCluster = 'edge/cluster'
}

type AllFeatures = Device

export enum CommonOperation {
  List = 'list',
  Add = 'add',
  Edit = 'edit',
  Detail = 'details'
}

export const ID = ':id'
export const activeTab = ':activeTab'
export const activeSubTab = ':activeSubTab'

const pathConfig = {
  [CommonOperation.List]: [CommonOperation.List],
  [CommonOperation.Add]: [CommonOperation.Add],
  [CommonOperation.Edit]: [ID, CommonOperation.Edit],
  [CommonOperation.Detail]: [ID, CommonOperation.Detail]
}

type UrlRequest = {
  category?: CommonCategory
  feature: AllFeatures
  oper: CommonOperation
  idKey?: string // change id name
  before?: string[] // add path before
  after?: string[] // add path after
  params?: unknown
}

const defaultCategoryFeatureMapping = {
  [CommonCategory.Device]: Object.values(Device)
}

const getFeatureBasePath = (feature: AllFeatures, category?: CommonCategory): string[] => {
  if(category) {
    return [category, feature]
  } else {
    for (const [key, value] of Object.entries(defaultCategoryFeatureMapping)) {
      if(value.includes(feature)) {
        return [key, feature]
      }
    }
    return [feature]
  }
}

export const getUrl = (req: UrlRequest) => {
  const { category, feature, oper, idKey, before, after, params } = req
  let result = getFeatureBasePath(feature, category)
  result = result.concat(pathConfig[oper])
  if(before) {
    result.unshift(...before)
  }
  if(after) {
    result.push(...after)
  }
  if(idKey) {
    const idIndex = result.indexOf(ID)
    result[idIndex] = `:${idKey}`
  }
  return genUrl(result, params as Params<string>)
}

export const genUrl = (pathArr: string[], params?: Params<string>) => {
  return generatePath('/' + pathArr.join('/'), params)
}
