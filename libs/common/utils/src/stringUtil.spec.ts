/* eslint-disable max-len */
import { byteCounter } from './stringUtil'


describe('StringUtils', () => {

  it('should byteCounter function count according to characters set, regular 1 char 1 byte, UTF8 1 char 2 bytes', () => {
    //Note that the length are equal.
    const regularCharacters = 'abcdefghijklmnop'
    const utf8Characters = 'אבגדהוזחטיכלמנסע'
    const utf8CharactersChinese = '我愛你一枝花' // utf8: 3 byte per Chinese character
    const utf8CharactersJapen='ユランはパンテーンを使' // utf8: 3 byte per Japen character
    //Byte counter should show the difference between the UTF8 Characters and regular Characters
    expect(byteCounter(utf8Characters)).toBe(32)
    expect(byteCounter(regularCharacters)).toBe(16)
    expect(byteCounter(utf8CharactersChinese)).toBe(18)
    expect(byteCounter(utf8CharactersJapen)).toBe(33)
  })
})