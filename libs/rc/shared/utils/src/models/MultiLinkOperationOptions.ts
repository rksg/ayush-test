export class MultiLinkOperationOptions {
  enable24G?: boolean

  enable50G?: boolean

  enable6G?: boolean

  constructor () {
    this.enable24G = true

    this.enable50G = true

    this.enable6G = false
  }
}