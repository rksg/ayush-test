export class PdfGeneratorService {
  private bodyElement: HTMLBodyElement
  private printArea: HTMLDivElement | null

  constructor () {
    this.bodyElement = document.querySelector('body') || document.createElement('body')
    const printDiv = document.createElement('div')
    printDiv.id = 'printArea'
    this.bodyElement.append(printDiv)
    this.printArea = document.querySelector('#printArea')
    this.bodyElement.classList.add('not-printable')
  }

  public generatePrint (printTemplate: string) {
    if(this.printArea){
      this.printArea.innerHTML = printTemplate
    }
    this.printDocument()
  }

  private removePrintArea () {
    if (this.printArea) {
      this.printArea.remove()
      this.printArea = null
    }
    this.bodyElement.classList.remove('not-printable')
  }

  private printDocument () {
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print')
      // For Safari support
      mediaQueryList.onchange = (e) => {
        if (!e.matches) {
          // this.removePrintArea()
        }
      }
      setTimeout(() => {
        window.print()
        if (navigator.userAgent.indexOf('Safari') === -1) {
          // this.removePrintArea()
        }
      }, 100)
    } else {
      setTimeout(() => {
        window.print()
        // this.removePrintArea()
      }, 100)
    }
  }
}
