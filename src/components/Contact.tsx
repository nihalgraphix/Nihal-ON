import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Linkedin,
  Github,
  Instagram,
  Dribbble,
  Youtube,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import EditableText from './EditableText';
import { useCustomization } from '../context/CustomizationContext';

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

function FloatingInput({ label, type = 'text', value, onChange, required }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative w-full">
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full rounded-full bg-[#111215] px-6 py-3.5 text-sm text-white border transition-all duration-200 outline-none ${
          isFocused
            ? 'border-[#FF5A1F] ring-1 ring-[#FF5A1F]/80 shadow-[0_0_15px_rgba(255,90,31,0.15)]'
            : 'border-neutral-600/80 hover:border-neutral-400'
        }`}
      />
      <label
        className={`pointer-events-none absolute left-6 transition-all duration-200 font-syne ${
          isFloating
            ? '-top-2.5 text-[11px] font-bold text-[#FF5A1F] bg-[#0f0f11] px-2 rounded-full z-10'
            : 'top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

interface FloatingTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  rows?: number;
}

function FloatingTextArea({ label, value, onChange, required, rows = 4 }: FloatingTextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative w-full">
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full rounded-[28px] bg-[#111215] px-6 py-4 text-sm text-white border transition-all duration-200 outline-none resize-none ${
          isFocused
            ? 'border-[#FF5A1F] ring-1 ring-[#FF5A1F]/80 shadow-[0_0_15px_rgba(255,90,31,0.15)]'
            : 'border-neutral-600/80 hover:border-neutral-400'
        }`}
      />
      <label
        className={`pointer-events-none absolute left-6 transition-all duration-200 font-syne ${
          isFloating
            ? '-top-2.5 text-[11px] font-bold text-[#FF5A1F] bg-[#0f0f11] px-2 rounded-full z-10'
            : 'top-5 text-sm text-neutral-400 font-medium'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export default function Contact() {
  const { saveContactMessage } = useCustomization();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let sentSuccessfully = false;

    // 1. Save to real-time Firestore DB (`contact_messages`) so Admin Dashboard Inbox receives it live
    try {
      if (saveContactMessage) {
        await saveContactMessage({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          message: formData.message,
        });
        sentSuccessfully = true;
      }
    } catch (dbErr) {
      console.warn('Firestore save contact message warning:', dbErr);
    }

    // 2. Try server API endpoint (/api/contact) for server logging & email dispatch
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.success !== false) {
          sentSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn('Backend API submission warning:', err);
    }

    // 2. Direct client-side dispatch if server API didn't return OK (e.g. static site or network issue)
    if (!sentSuccessfully) {
      const webhookUrl = "https://script.google.com/macros/s/AKfycbxNW40z9ak0LQvvT5dMqa4UTGWNASouVnUHmcFu5G9A2CQsLTxOSfd_r56gX-GUrGHJ/exec";
      const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });
      const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Portfolio Visitor";

      // A. Direct FormSubmit AJAX dispatch
      try {
        await fetch('https://formsubmit.co/ajax/nihal.graphix@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Portfolio Inquiry from ${fullName}`,
            _replyto: formData.email,
            "Sender Name": fullName,
            "Sender Email": formData.email,
            "Phone Number": formData.phone || "N/A",
            "Country & Place": formData.country || "N/A",
            "Message": formData.message
          })
        });
        sentSuccessfully = true;
      } catch (fErr) {
        console.warn('Direct FormSubmit warning:', fErr);
      }

      // B. Direct Google Apps Script Webhook dispatch
      try {
        const fullPayload = {
          timestamp,
          Timestamp: timestamp,
          date: timestamp,
          Date: timestamp,
          firstName: formData.firstName || "",
          "First Name": formData.firstName || "",
          Firstname: formData.firstName || "",
          first_name: formData.firstName || "",
          lastName: formData.lastName || "",
          "Last Name": formData.lastName || "",
          Lastname: formData.lastName || "",
          last_name: formData.lastName || "",
          name: fullName,
          Name: fullName,
          fullName: fullName,
          "Full Name": fullName,
          email: formData.email || "",
          Email: formData.email || "",
          phone: formData.phone || "",
          Phone: formData.phone || "",
          phone_number: formData.phone || "",
          "Phone Number": formData.phone || "",
          country: formData.country || "",
          Country: formData.country || "",
          "Country / Place": formData.country || "",
          message: formData.message || "",
          Message: formData.message || "",
          comments: formData.message || "",
          Comments: formData.message || ""
        };

        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(fullPayload)) {
          params.append(k, String(v));
        }

        const webhookQueryUrl = webhookUrl + (webhookUrl.includes("?") ? "&" : "?") + params.toString();

        await fetch(webhookQueryUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(fullPayload)
        });
        sentSuccessfully = true;
      } catch (wErr) {
        console.warn('Direct Google Apps Script warning:', wErr);
      }
    }

    if (sentSuccessfully) {
      setFormSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        message: ''
      });
    } else {
      setErrorMessage('Could not submit form. Please check your connection or try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="relative py-28 bg-[#090909] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF5A1F]/10 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading & Direct Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-space uppercase tracking-widest text-[#FF5A1F] mb-3">
                <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
                <EditableText id="contact-tag" as="span" defaultText="Start A Conversation" />
              </div>
              <EditableText
                id="contact-title"
                as="h2"
                className="font-syne text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
                defaultText="Let's Build Something Amazing."
              />
              <EditableText
                id="contact-subtitle"
                as="p"
                className="text-neutral-300 text-sm font-sans mt-4 leading-relaxed"
                defaultText="Have a new venture, product redesign, or Framer motion concept in mind? Fill out the form or reach out directly."
              />
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="group flex items-center gap-4 p-4 rounded-2xl glass-card border border-white/10 hover:border-[#FF5A1F]/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F] group-hover:bg-[#FF5A1F] group-hover:text-black transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-space text-neutral-500 uppercase block">Direct Email</span>
                  <span className="font-syne font-bold text-white text-sm group-hover:text-[#FF5A1F] transition-colors">
                    {PERSONAL_INFO.email}
                  </span>
                </div>
              </a>

              <a
                href={`tel:${PERSONAL_INFO.phone}`}
                className="group flex items-center gap-4 p-4 rounded-2xl glass-card border border-white/10 hover:border-[#FF5A1F]/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F] group-hover:bg-[#FF5A1F] group-hover:text-black transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-space text-neutral-500 uppercase block">Direct Line</span>
                  <span className="font-syne font-bold text-white text-sm group-hover:text-[#FF5A1F] transition-colors">
                    {PERSONAL_INFO.phone}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-space text-neutral-500 uppercase block">Location</span>
                  <span className="font-syne font-bold text-white text-sm">
                    {PERSONAL_INFO.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 text-center">
              <span className="text-xs uppercase font-space text-neutral-400 font-bold block mb-4 text-center">
                Connect Across Networks
              </span>
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap max-w-full">
                {[
                  {
                    name: "Instagram",
                    url: PERSONAL_INFO.instagram || "https://instagram.com",
                    icon: (props: { className?: string }) => <Instagram className={props.className} />,
                  },
                  {
                    name: "Behance",
                    url: "https://behance.net",
                    icon: (props: { className?: string }) => (
                      <svg className={props.className} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 7h-7v-2h7v2zm-11.83 3.483c.801-.362 1.332-1.034 1.332-1.983 0-1.834-1.367-2.5-3.513-2.5h-4.989v12h5.389c2.47 0 3.861-1.127 3.861-2.923 0-1.636-1.109-2.312-2.08-2.594zm-4.17-2.483h1.838c.847 0 1.342.308 1.342 1.011 0 .741-.532 1.059-1.342 1.059h-1.838v-2.07zm2.085 7h-2.085v-2.392h2.085c.98 0 1.518.352 1.518 1.156 0 .848-.538 1.236-1.518 1.236zm10.915-4.559c-2.955 0-4.667 2.018-4.667 4.707 0 2.665 1.71 4.852 4.789 4.852 2.285 0 3.822-1.108 4.385-2.812h-2.148c-.282.594-.961.981-1.921.981-1.391 0-2.281-.884-2.361-2.228h6.581c.038-.282.059-.594.059-.884 0-2.613-1.688-4.616-4.717-4.616zm-2.278 3.328c.117-1.108.921-1.802 2.161-1.802 1.196 0 2.001.694 2.118 1.802h-4.279z"/>
                      </svg>
                    ),
                  },
                  {
                    name: "LinkedIn",
                    url: PERSONAL_INFO.linkedin || "https://linkedin.com",
                    icon: (props: { className?: string }) => <Linkedin className={props.className} />,
                  },
                  {
                    name: "WhatsApp",
                    url: `https://wa.me/${PERSONAL_INFO.phone.replace(/[^0-9]/g, '')}`,
                    icon: (props: { className?: string }) => (
                      <svg className={props.className} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.761.459 3.479 1.332 4.992l-1.417 5.176 5.297-1.389c1.458.796 3.097 1.216 4.773 1.217h.004c5.507 0 9.99-4.478 9.99-9.985 0-2.668-1.039-5.176-2.925-7.062a9.925 9.925 0 0 0-7.057-2.934zm5.179 14.167c-.214.603-1.248 1.155-1.722 1.23-.473.075-1.091.135-3.153-.672-2.639-1.033-4.329-3.716-4.462-3.892-.132-.176-1.077-1.433-1.077-2.732 0-1.299.68-1.938.922-2.197.242-.259.528-.324.704-.324.176 0 .352.001.506.009.165.008.385-.063.603.459.219.529.748 1.828.814 1.96.066.132.11.286.022.462-.088.176-.132.286-.264.44-.132.154-.277.344-.396.462-.132.132-.27.275-.116.539.154.264.685 1.128 1.47 1.828 1.008.899 1.859 1.178 2.123 1.31.264.132.418.11.572-.066.154-.176.66-.77.836-1.034.176-.264.352-.22.594-.132.242.088 1.54.726 1.804.858.264.132.44.198.506.308.066.11.066.638-.148 1.241z"/>
                      </svg>
                    ),
                  },
                  {
                    name: "GitHub",
                    url: PERSONAL_INFO.github || "https://github.com",
                    icon: (props: { className?: string }) => <Github className={props.className} />,
                  },
                  {
                    name: "Dribbble",
                    url: PERSONAL_INFO.dribbble || "https://dribbble.com",
                    icon: (props: { className?: string }) => <Dribbble className={props.className} />,
                  }
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      aria-label={s.name}
                      className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#161618] text-neutral-300 hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-black transition-all duration-300 shadow-md hover:scale-110 active:scale-95"
                    >
                      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Exact Form matching user design */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10 space-y-6 bg-[#0f0f11]">
              {formSubmitted ? (
                <div className="p-8 rounded-3xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/50 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-[#FF5A1F] mx-auto" />
                  <h4 className="font-syne text-xl font-bold text-white">Message Dispatched!</h4>
                  <p className="text-xs text-neutral-300 font-sans">
                    Thank you for reaching out. Nihal . ON will review your message and respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingInput
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={(val) => setFormData({ ...formData, firstName: val })}
                    />
                    <FloatingInput
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(val) => setFormData({ ...formData, lastName: val })}
                    />
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingInput
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(val) => setFormData({ ...formData, email: val })}
                    />
                    <FloatingInput
                      label="Phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                    />
                  </div>

                  {/* Row 3: Country & Place */}
                  <div>
                    <FloatingInput
                      label="Country & Place"
                      value={formData.country}
                      onChange={(val) => setFormData({ ...formData, country: val })}
                    />
                  </div>

                  {/* Row 4: Your Message */}
                  <div>
                    <FloatingTextArea
                      label="Your Message"
                      required
                      value={formData.message}
                      onChange={(val) => setFormData({ ...formData, message: val })}
                    />
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-sans">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 5: Submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer font-syne"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
