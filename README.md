# Medusajs Talksasa SMS plugin

[![Medusa Plugin](https://img.shields.io/badge/Medusa-Plugin-violet.svg)](https://medusajs.com/)
[![NPM Version](https://img.shields.io/npm/v/medusajs-talksasa-sms-plugin.svg)](https://www.npmjs.com/package/medusajs-talksasa-sms-plugin)

A robust, production-ready SMS notification provider plugin for **MedusaJS v2**. 

This plugin seamlessly integrates the [Talksasa API](https://talksasa.com/) into your Medusa store's Notification Module, allowing you to send transactional SMS messages (like order confirmations, shipping updates, and verification codes) to your customers globally.

---

## 🌟 Features

- **Native Medusa v2 Support**: Built specifically for the Medusa v2 Notification Module architecture (`AbstractNotificationProviderService`).
- **Cost Saving Guardrails**: Automatically skips sending (and bypasses API calls) if a customer's phone number is missing, preventing unnecessary API errors or costs.
- **Omni-Channel Ready**: Designed to work flawlessly alongside Email and WhatsApp notification providers in your global subscribers.
- **Simple Configuration**: Plugs directly into your `medusa-config.ts` without complex setup.

## 📋 Prerequisites

- [Medusa backend](https://docs.medusajs.com/) (version 2.0.0 or higher)
- A [Talksasa](https://talksasa.com/) account with an active API Token and registered Sender ID.

## 🚀 Installation

Install the plugin using your preferred package manager in your Medusa backend project:

```bash
npm install medusajs-talksasa-sms-plugin
# or
yarn add medusajs-talksasa-sms-plugin
```

## ⚙️ Configuration

### 1. Environment Variables

Add your Talksasa API credentials to your Medusa backend's `.env` file. You can find these in your Talksasa developer dashboard. 

*(Note: Ensure your API Token includes the ID prefix if provided, e.g., `3318|cjVm7zz...`)*

```env
TALKSASA_API_TOKEN=your_full_talksasa_api_token
TALKSASA_SENDER_ID=your_registered_sender_id
```

### 2. Medusa Config

Next, register the plugin in your `medusa-config.ts` file under the Notification Module:

```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    // ... your standard project config
  },
  modules: [
    {
      resolve: Modules.NOTIFICATION,
      options: {
        providers: [
          // ... your other providers (e.g. Resend, SendGrid)
          {
            resolve: "medusajs-talksasa-sms-plugin",
            id: "talksasa-sms",
            options: {
              channels: ["sms"],
              apiToken: process.env.TALKSASA_API_TOKEN,
              senderId: process.env.TALKSASA_SENDER_ID,
            },
          },
        ],
      },
    },
  ],
})
```

## 💻 Usage Example

Once installed, the plugin listens for notification requests directed to the `"sms"` channel. 

You can dispatch SMS notifications directly from your Medusa Workflows or Subscribers. The plugin will automatically extract the plain-text message from the `text` field in your `data` payload.

### In a Subscriber

```typescript
import { SubscriberArgs } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  
  const customerPhoneNumber = "254700000000" // Fetch this from your order/customer data
  
  await notificationModuleService.createNotifications({
    to: customerPhoneNumber,
    channel: "sms",
    template: "order-placed-sms", // Required by Medusa type definitions
    data: {
      text: `Great news! Your order #${event.data.id} has been placed successfully.`,
    },
  })
}
```

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the repository.

## 📄 License

This project is licensed under the MIT License.
