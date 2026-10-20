import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { api } from "../lib/api";

export default function Contact({ setPage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    let mounted = true;

    api
      .get("/users/me")
      .then((user) => {
        if (!mounted || !user) return;

        setFormData((current) => ({
          ...current,
          name: user.username || "",
          email: user.email || "",
        }));
      })
      .catch(() => {
        // Contact form can still be used manually.
      })
      .finally(() => {
        if (mounted) {
          setLoadingProfile(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setSending(true);

      await api.post("/contact/messages", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSuccess(
        "Thank you! Your message has been sent successfully."
      );

      setFormData((current) => ({
        ...current,
        subject: "",
        message: "",
      }));
    } catch (err) {
      setError(
        err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="min-h-[75vh] px-4 pb-10 pt-6 sm:px-6 lg:px-8">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() => setPage("home")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mb-7">

          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Get in touch
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact TechNova
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Have a question, need help with an order, or want to
            know more about our products? Send us a message.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.65fr]">

          {/* ======================================================
              CONTACT FORM
          ====================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                Send us a message
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your message will be saved securely and reviewed
                by the TechNova support team.
              </p>

            </div>

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                <CheckCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm font-medium text-emerald-800">
                  {success}
                </p>

              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={loadingProfile}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  required
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Your account email is filled automatically. You
                  can change it for this message.
                </p>
              </div>

              {/* Subject */}

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Message */}

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={7}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send Message
                  </>
                )}
              </button>

            </form>

          </div>

          {/* ======================================================
              CONTACT INFORMATION
          ====================================================== */}

          <div className="space-y-4">

            <ContactCard
              icon={<Mail size={20} />}
              title="Email"
              value="support@technova.com"
            />

            <ContactCard
              icon={<Phone size={20} />}
              title="Phone"
              value="+1 (800) 555-TECH"
            />

            <ContactCard
              icon={<MapPin size={20} />}
              title="Location"
              value="United States"
            />

            <ContactCard
              icon={<Clock size={20} />}
              title="Support Hours"
              value="Monday - Friday, 9:00 AM - 6:00 PM"
            />

            <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">

              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                TechNova Support
              </p>

              <h2 className="mt-2 text-xl font-medium text-white">
                We're here to help.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Whether you have a product question, order issue,
                or general inquiry, send us a message and our team
                can review it from the admin panel.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


// ============================================================
// CONTACT CARD
// ============================================================

function ContactCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}