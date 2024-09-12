import { Table, TableProps } from '../../Table'

const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    tooltip: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 150,
    align: 'center',
    isBetaFeature: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const basicColumns2: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    tooltip: 'name',
    searchable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 150,
    align: 'center',
    filterable: true,
    filterPlaceholder: 'Age',
    isBetaFeature: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const basicColumns3: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    tooltip: 'name',
    isBetaFeature: true,
    searchable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 150,
    align: 'center',
    filterable: true,
    filterPlaceholder: 'Age',
    isBetaFeature: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]


const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address'
  }
]

export function WithTable () {
  return <>
    Basic:
    <div>
      <Table
        columns={basicColumns}
        dataSource={basicData}
      />
    </div>
    <br></br><br></br>
    With selection (Beta Indicator):
    <div>
      <Table
        columns={basicColumns2}
        dataSource={basicData}
      />
    </div>
    <br></br><br></br>
    With selection (Tooltip & Beta Indicator):
    <div>
      <Table
        columns={basicColumns3}
        dataSource={basicData}
      />
    </div>
  </>
}
