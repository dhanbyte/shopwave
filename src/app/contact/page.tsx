
'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    // Here you would typically handle form submission, e.g., send an email or save to a database.
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Get in Touch</h2>
            <p className="text-gray-600">
              We'd love to hear from you. Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand" />
              <a href="mailto:support@shopwave.com" className="text-gray-700 hover:text-brand">support@shopwave.com</a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand" />
              <span className="text-gray-700">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand" />
              <span className="text-gray-700">123 Commerce Street, Mumbai, India</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" name="name" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea id="message" name="message" rows={4} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm p-2 border"></textarea>
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
