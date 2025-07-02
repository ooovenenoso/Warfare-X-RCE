"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsOfServiceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsOfService({ open, onOpenChange }: TermsOfServiceProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm pb-4">
            <div>
              <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
              <p>
                These Terms of Service ("Terms") govern your use of CNQR gaming platform and services ("Service")
                operated by CNQR ("us," "we," or "our").
              </p>
            </div>

            <section>
              <h3 className="font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part
                of these terms, you may not access the Service. These Terms constitute a legally binding agreement
                between you and CNQR.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">2. Description of Service</h3>
              <p>
                CNQR provides gaming services, virtual items, credits, and related digital content. All services are
                provided "as is" and "as available" without warranties of any kind.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">3. User Accounts</h3>
              <div className="space-y-2">
                <p>• You must provide accurate and complete information when creating an account</p>
                <p>• You are responsible for maintaining the security of your account</p>
                <p>• You must be at least 13 years old to use our services</p>
                <p>• One account per person; multiple accounts may result in termination</p>
                <p>• We reserve the right to suspend or terminate accounts at our sole discretion</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">4. Purchases and Payments</h3>
              <div className="space-y-2">
                <p>
                  <strong>NO REFUNDS:</strong> All purchases are final. We do not provide refunds, exchanges, or credits
                  for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Change of mind or buyer's remorse</li>
                  <li>Technical issues or service interruptions</li>
                  <li>Account suspension or termination</li>
                  <li>Loss of virtual items or progress</li>
                  <li>Dissatisfaction with services</li>
                </ul>
                <p>
                  <strong>Chargeback Policy:</strong> Before initiating any chargeback or dispute with your payment
                  provider, you MUST contact our support team first. Unauthorized chargebacks will result in immediate
                  account termination and may result in legal action.
                </p>
                <p>• All prices are subject to change without notice</p>
                <p>• You authorize us to charge your payment method for all purchases</p>
                <p>• Failed payments may result in service suspension</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">5. Virtual Items and Credits</h3>
              <div className="space-y-2">
                <p>• Virtual items have no real-world value and cannot be exchanged for real money</p>
                <p>• We may modify, remove, or discontinue virtual items at any time</p>
                <p>• Virtual items are non-transferable between accounts</p>
                <p>• Loss of virtual items due to technical issues is not compensated</p>
                <p>• We reserve the right to reset or modify virtual economies</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">6. Prohibited Conduct</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use cheats, exploits, or unauthorized third-party software</li>
                <li>Engage in harassment, abuse, or toxic behavior</li>
                <li>Attempt to hack, reverse engineer, or compromise our systems</li>
                <li>Share, sell, or transfer your account</li>
                <li>Use our services for illegal activities</li>
                <li>Spam, advertise, or promote other services</li>
                <li>Impersonate staff members or other users</li>
                <li>Exploit bugs or glitches for personal gain</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">7. Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account immediately, without prior notice or
                liability, for any reason, including breach of these Terms. Upon termination, your right to use the
                Service ceases immediately, and you forfeit all virtual items, credits, and progress.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">8. Intellectual Property</h3>
              <p>
                All content, features, and functionality of our Service are owned by CNQR and are protected by
                copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create
                derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">9. Disclaimers and Limitation of Liability</h3>
              <div className="space-y-2">
                <p>
                  <strong>Service Availability:</strong> We do not guarantee uninterrupted or error-free service.
                  Maintenance, updates, or technical issues may cause temporary unavailability.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, CNQR shall not be
                  liable for any indirect, incidental, special, consequential, or punitive damages, including but not
                  limited to loss of profits, data, or virtual items.
                </p>
                <p>
                  <strong>Maximum Liability:</strong> Our total liability to you for all claims shall not exceed the
                  amount you paid to us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">10. Indemnification</h3>
              <p>
                You agree to indemnify, defend, and hold harmless CNQR from any claims, damages, losses, or expenses
                arising from your use of the Service, violation of these Terms, or infringement of any rights of another
                party.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">11. Dispute Resolution</h3>
              <div className="space-y-2">
                <p>
                  <strong>Mandatory Support Contact:</strong> Before pursuing any legal action or dispute resolution,
                  you must contact our support team and allow 30 days for resolution.
                </p>
                <p>
                  <strong>Arbitration:</strong> Any disputes will be resolved through binding arbitration rather than in
                  court, except for small claims court matters.
                </p>
                <p>
                  <strong>Class Action Waiver:</strong> You waive your right to participate in class action lawsuits or
                  class-wide arbitration.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">12. Governing Law</h3>
              <p>
                These Terms are governed by and construed in accordance with the laws of the United States, without
                regard to conflict of law principles. Any legal action must be brought in the courts of the United
                States.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">13. Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in
                full force and effect. The unenforceable provision will be replaced with an enforceable provision that
                most closely reflects our intent.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">14. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time without prior notice. Changes become effective
                immediately upon posting. Your continued use of the Service constitutes acceptance of the modified
                Terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">15. Contact Information</h3>
              <p>
                For questions about these Terms, contact us through our Discord server or support system. We will
                respond at our discretion within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">16. Entire Agreement</h3>
              <p>
                These Terms constitute the entire agreement between you and CNQR regarding the use of our Service and
                supersede all prior agreements and understandings.
              </p>
            </section>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-500 font-semibold">
                BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE
                TERMS OF SERVICE.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
