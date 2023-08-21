import { handleBlobDownloadFile } from './fileUtil'


describe('handleBlobDownloadFile', () => {
  it('should create a hidden link with correct attributes and trigger the download', () => {
    const fileBlob = new Blob()
    const fileName = 'test.txt'

    const createElementSpy = jest.spyOn(document, 'createElement')
    const createObjectURLMock = jest.fn().mockReturnValue('mocked-url')
    URL.createObjectURL = createObjectURLMock

    handleBlobDownloadFile(fileBlob, fileName)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(createObjectURLMock).toHaveBeenCalledWith(fileBlob)
  })

  it('should not create a link if the download attribute is not supported', () => {
    const fileBlob = new Blob()
    const fileName = 'test.txt'

    Object.defineProperty(global.HTMLAnchorElement.prototype, 'download', {
      value: undefined,
      writable: true
    })

    const link = document.createElement('a')
    const createElementSpy = jest.spyOn(document, 'createElement')
    const setAttributeSpy = jest.spyOn(link, 'setAttribute')
    const clickSpy = jest.spyOn(link, 'click')
    handleBlobDownloadFile(fileBlob, fileName)
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(setAttributeSpy).not.toHaveBeenCalled()
    expect(clickSpy).not.toHaveBeenCalled()
  })
})