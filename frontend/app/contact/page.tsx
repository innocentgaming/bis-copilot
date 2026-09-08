"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Building2, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/common/Toast";
import { Footer } from "@/components/layout/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Technical Query");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { success: toastSuccess } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toastSuccess("Thank you! Your inquiry has been submitted to the BIS Helpdesk.");
  };

  const offices = [
    {
      name: "BIS Headquarters (Manak Bhavan)",
      address: "9 Bahadur Shah Zafar Marg, New Delhi - 110002",
      phone: "+91 11 2323 0131",
      email: "info@bis.gov.in"
    },
    {
      name: "Northern Regional Office (NRO)",
      address: "Plot No. 4-A, Sector 27-B, Chandigarh - 160019",
      phone: "+91 172 265 0206",
      email: "nro@bis.gov.in"
    },
    {
      name: "Western Regional Office (WRO)",
      address: "Manakalaya, E-9, MIDC, Andheri (East), Mumbai - 400093",
      phone: "+91 22 2832 9295",
      email: "wro@bis.gov.in"
    },
    {
      name: "Southern Regional Office (SRO)",
      address: "CIT Campus, IV Cross Road, Taramani, Chennai - 600113",
      phone: "+91 44 2254 1216",
      email: "sro@bis.gov.in"
    },
    {
      name: "Eastern Regional Office (ERO)",
      address: "1/14 C.I.T. Scheme VII M, V.I.P. Road, Kankurgachi, Kolkata - 700054",
      phone: "+91 33 2320 7080",
      email: "ero@bis.gov.in"
    },
    {
      name: "Central Regional Office (CRO)",
      address: "Manak Bhavan, Central Laboratory, Sahibabad, Ghaziabad - 201010",
      phone: "+91 120 286 7900",
      email: "cro@bis.gov.in"
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bureau of Indian Standards Helpdesk & Offices
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Connect with BIS central headquarters, regional branches, and technical committees across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            Submit Public Query
          </h3>

          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Inquiry Received
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                A BIS technical grievance ticket has been generated. You will receive an email confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Query Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option>Technical Standard Query</option>
                  <option>ISI Mark Certification</option>
                  <option>Compulsory Registration (CRS)</option>
                  <option>Hallmarking Grievance</option>
                  <option>Laboratory Recognition</option>
                  <option>Other / General</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify product, standard number (IS), or application number..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to BIS Helpdesk</span>
              </button>
            </form>
          )}
        </div>

        {/* Regional Offices Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Regional & Central Offices
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offices.map((off, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
              >
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {off.name}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>{off.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono">{off.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{off.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
