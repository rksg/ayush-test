import { removeRowIds, updateRowIds } from './utils'


describe('utils function test', () => {
  it('The Add RowIds successfully', async () => {
    const data = [{
      name: 'test1'
    }, {
      name: 'test2'
    }]

    const newData = updateRowIds(data)

    // the function doesn't change the original data
    const [ data0, data1 ] = data
    expect(('name' in data0)).toBeTruthy()
    expect(('rowId' in data1)).toBeFalsy()

    // the rowId has been added
    const [ newData0, newData1 ] = newData
    expect(('name' in newData0)).toBeTruthy()
    expect(('rowId' in newData0)).toBeTruthy()
    expect(newData0.rowId).toBe(0)
    expect(newData1.rowId).toBe(1)
  })

  it('The Update RowIds successfully', async () => {
    const data = [{
      name: 'test1',
      rowId: 100
    }, {
      name: 'test2',
      rowId: 99
    }]

    const newData = updateRowIds(data)

    // the function doesn't change the original data
    const [ data0, data1 ] = data
    expect(data0.rowId).toBe(100)
    expect(data1.rowId).toBe(99)

    // the rowId has been update
    const [ newData0, newData1 ] = newData
    expect(('name' in newData0)).toBeTruthy()
    expect(('rowId' in newData0)).toBeTruthy()
    expect(newData0.rowId).toBe(0)
    expect(newData1.rowId).toBe(1)
  })

  it('The Remove RowIds successfully', async () => {
    const data = [{
      name: 'test1',
      rowId: 0
    }, {
      name: 'test2',
      rowId: 1
    }]

    const newData = removeRowIds(data)

    // the function doesn't change the original data
    const [ data0, data1 ] = data
    expect(('name' in data0)).toBeTruthy()
    expect(('rowId' in data0)).toBeTruthy()
    expect(data0.rowId).toBe(0)
    expect(data1.rowId).toBe(1)

    // the rowId has been remove
    const [ newData0, newData1 ] = newData
    expect(('name' in newData0)).toBeTruthy()
    expect(('rowId' in newData0)).toBeFalsy()
    expect(('rowId' in newData1)).toBeFalsy()

  })
})