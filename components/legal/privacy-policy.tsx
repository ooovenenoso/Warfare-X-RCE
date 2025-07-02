"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrivacyPolicyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyPolicy({ open, onOpenChange }: PrivacyPolicyProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm pb-4">
            <div>
              <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
              <p>
                This Privacy Policy describes how CNQR ("we," "our," or "us") collects, uses, and protects your
                information when you use our gaming platform and services.
              </p>
            </div>

            <section>
              <h3 className="font-semibold text-lg mb-3">1. Information We Collect</h3>
              <div className="space-y-2">
                <p>
                  <strong>Account Information:</strong> Username, email address, Discord ID, and payment information.
                </p>
                <p>
                  <strong>Usage Data:</strong> IP address, device information, browser type, gameplay statistics, and
                  interaction logs.
                </p>
                <p>
                  <strong>Communication Data:</strong> Messages sent through our platform, support tickets, and Discord
                  communications.
                </p>
                <p>
                  <strong>Payment Data:</strong> Transaction history, payment methods, and billing information
                  (processed securely through Stripe).
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">2. How We Use Your Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our gaming services</li>
                <li>Process transactions and deliver purchased items</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">3. Information Sharing</h3>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service providers (Stripe for payments, Discord for integration)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners for legitimate business purposes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">4. Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your information. However, no method of
                transmission over the internet is 100% secure. You acknowledge and accept the inherent risks of online
                data transmission.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">5. Data Retention</h3>
              <p>
                We retain your information for as long as necessary to provide services, comply with legal obligations,
                resolve disputes, and enforce our agreements. Account data may be retained indefinitely for security and
                fraud prevention purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">6. Your Rights</h3>
              <p>
                Subject to applicable law, you may request access to, correction of, or deletion of your personal
                information. We reserve the right to verify your identity and may deny requests that are unreasonable or
                prohibited by law.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">7. Cookies and Tracking</h3>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide
                personalized content. By using our platform, you consent to our use of cookies.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">8. Third-Party Services</h3>
              <p>
                Our platform integrates with third-party services (Discord, Stripe, etc.). Your use of these services is
                subject to their respective privacy policies. We are not responsible for their privacy practices.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">9. Children's Privacy</h3>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect personal information
                from children under 13. If you believe we have collected such information, contact us immediately.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">10. International Users</h3>
              <p>
                By using our services, you consent to the transfer and processing of your information in the United
                States and other countries where we operate, regardless of your location.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">11. Changes to Privacy Policy</h3>
              <p>
                We may update this Privacy Policy at any time without prior notice. Your continued use of our services
                constitutes acceptance of any changes. It is your responsibility to review this policy regularly.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">12. Contact Information</h3>
              <p>
                For privacy-related questions, contact us through our Discord server or support system. We will respond
                within a reasonable timeframe at our discretion.
              </p>
            </section>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-500">
                This Privacy Policy is governed by the laws of the United States. Any disputes will be resolved in
                accordance with our Terms of Service.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
