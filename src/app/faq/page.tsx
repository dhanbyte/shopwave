
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, and Net Banking. We also offer Cash on Delivery (COD) for most locations.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive an email and an SMS with the tracking details. You can also track your order from the 'My Orders' section in your account.",
  },
  {
    question: "What is your return policy?",
    answer: "All sales are final - no returns or exchanges. Refunds are only available if the product is not delivered, arrives damaged, or is completely wrong. Please review your order carefully before purchasing.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 3-7 business days depending on your location. You can see an estimated delivery date at checkout.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. We are working on expanding our services to other countries soon.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
