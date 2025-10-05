import { isPlatformNative } from "../platform"

export interface Contact {
  contactId: string
  displayName?: string
  phoneNumbers?: Array<{ number: string; type?: string }>
  emails?: Array<{ address: string; type?: string }>
}

class ContactsManager {
  private isNative = false

  constructor() {
    if (typeof window !== "undefined") {
      this.isNative = isPlatformNative()
    }
  }

  async hasPermission(): Promise<boolean> {
    if (!this.isNative) return false

    try {
      const { Contacts } = await import("@capacitor/contacts")
      const result = await Contacts.checkPermissions()
      return result.contacts === "granted"
    } catch (error) {
      console.error("[v0] Failed to check contacts permissions:", error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isNative) return false

    try {
      const { Contacts } = await import("@capacitor/contacts")
      const result = await Contacts.requestPermissions()
      return result.contacts === "granted"
    } catch (error) {
      console.error("[v0] Failed to request contacts permissions:", error)
      return false
    }
  }

  async pickContact(): Promise<Contact | null> {
    if (!this.isNative) {
      return null
    }

    try {
      const { Contacts } = await import("@capacitor/contacts")
      const result = await Contacts.pickContact({
        projection: {
          name: true,
          phones: true,
          emails: true,
        },
      })

      if (!result.contact) return null

      return {
        contactId: result.contact.contactId,
        displayName: result.contact.name?.display,
        phoneNumbers: result.contact.phones?.map((p: any) => ({
          number: p.number,
          type: p.type,
        })),
        emails: result.contact.emails?.map((e: any) => ({
          address: e.address,
          type: e.type,
        })),
      }
    } catch (error) {
      console.error("[v0] Failed to pick contact:", error)
      return null
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!this.isNative) {
      return []
    }

    try {
      const { Contacts } = await import("@capacitor/contacts")
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
          emails: true,
        },
      })

      if (!result.contacts) return []

      // Filter contacts by query
      const filtered = result.contacts.filter((contact: any) => {
        const name = contact.name?.display?.toLowerCase() || ""
        return name.includes(query.toLowerCase())
      })

      return filtered.map((contact: any) => ({
        contactId: contact.contactId,
        displayName: contact.name?.display,
        phoneNumbers: contact.phones?.map((p: any) => ({
          number: p.number,
          type: p.type,
        })),
        emails: contact.emails?.map((e: any) => ({
          address: e.address,
          type: e.type,
        })),
      }))
    } catch (error) {
      console.error("[v0] Failed to search contacts:", error)
      return []
    }
  }
}

export const contactsManager = new ContactsManager()
