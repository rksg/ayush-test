import { useApGroupsListQuery } from '@acx-ui/rc/services'

export const useApGroupsFilterOpts =
  (filters?: Record<string, unknown[]>)
   : ({ key: string, value: string }[] | boolean) => {

    const { apGroupOptions } = useApGroupsListQuery({
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        filters: filters ?? { isDefault: [false] }
      }
    }, {
      selectFromResult: ({ data }) => ({
        apGroupOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    })

    return apGroupOptions
  }