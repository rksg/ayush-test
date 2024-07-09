import _ from 'lodash'

export const transformToCityListOptions = (data: { name: string }[] | undefined) => {
  return data?.map(v=>({
    key: v.name,
    value: v.name.split(', ').map(_.startCase).join(', ')
  })) || true
}
