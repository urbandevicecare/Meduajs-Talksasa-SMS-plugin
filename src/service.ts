import { 
  AbstractNotificationProviderService,
} from "@medusajs/framework/utils"
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO,
} from "@medusajs/types"

type InjectedDependencies = {}

export type TalksasaSmsServiceOptions = {
  apiToken: string
  senderId: string
}

export class TalksasaSmsService extends AbstractNotificationProviderService {
  static readonly identifier = "talksasa-sms"
  private readonly apiToken: string
  private readonly senderId: string

  constructor(container: InjectedDependencies, options: TalksasaSmsServiceOptions) {
    super()

    this.apiToken = options.apiToken
    this.senderId = options.senderId
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.apiToken) {
      throw new Error("apiToken is required for talksasa-sms notification provider")
    }
    if (!options.senderId) {
      throw new Error("senderId is required for talksasa-sms notification provider")
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { to, content, template, data } = notification
    
    if (!to || to.trim() === "") {
      return {
        id: `talksasa-skipped-${Date.now()}`
      }
    }

    // For SMS, we typically just use the content text directly.
    const contentText = content?.text || (data?.text as string) || `Notification from template: ${template}`

    try {
      const response = await fetch("https://bulksms.talksasa.com/api/v3/sms/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          recipient: to,
          sender_id: this.senderId,
          type: "plain",
          message: contentText
        })
      })

      const responseData = await response.json()

      if (responseData.status === "error") {
        throw new Error(responseData.message || "Unknown error from Talksasa API")
      }

      return {
        // Talksasa returns a contact object in data, which might contain an id
        // We can just return a generic success id or extract it if available
        id: responseData.data?.uid || `talksasa-${Date.now()}`,
      }
    } catch (error: any) {
      throw new Error(`Failed to send SMS via Talksasa: ${error.message}`)
    }
  }
}

export default TalksasaSmsService
