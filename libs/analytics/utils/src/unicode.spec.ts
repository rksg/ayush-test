import { decodeUnicode } from '.'

describe('Unicode', ()=>{
  test('decodeUnicode',()=>{
    const unicodeString = 'JHHJKJ%^\u0026\u0026*()OKJJHGGBNYTRFCHHBVF'
    expect(decodeUnicode(unicodeString)).toMatchSnapshot()
  })
  test('with pound sign unicode',()=>{
    const unicodeString = 'Pay me 30\\u00A3'
    expect(decodeUnicode(unicodeString)).toMatchSnapshot()
  })
})