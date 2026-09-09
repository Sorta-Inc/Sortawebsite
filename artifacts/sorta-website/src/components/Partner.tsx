import { JpH2 } from '@/components/JpH2';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Same-origin Cloudflare Pages Function — see functions/api/contact.js
const CONTACT_ENDPOINT = '/api/contact';

type FormStatus = 'idle' | 'success' | 'error';

export default function Partner() {
  const { tr } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');

  const formSchema = z.object({
    companyName: z.string().min(2, { message: tr('partner', 'validationCompany') }),
    industry: z.string().min(1, { message: tr('partner', 'validationIndustry') }),
    location: z.string().min(2, { message: tr('partner', 'validationLocation') }),
    spaceType: z.string().min(1, { message: tr('partner', 'validationSpaceType') }),
    footfall: z.string().min(1, { message: tr('partner', 'validationFootfall') }),
    contactName: z.string().min(2, { message: tr('partner', 'validationContact') }),
    email: z.string().email({ message: tr('partner', 'validationEmail') }),
    message: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      location: '',
      spaceType: '',
      footfall: '',
      contactName: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    setFormStatus('idle');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('server error');
      form.reset();
      setFormStatus('success');
    } catch {
      setFormStatus('error');
    } finally {
      setSubmitting(false);
    }
  }

  const bullets = [
    'bullet1' as const,
    'bullet2' as const,
    'bullet3' as const,
  ];

  const industryOptions = [
    { value: 'retail', labelKey: 'industryRetail' as const },
    { value: 'transit', labelKey: 'industryTransit' as const },
    { value: 'public', labelKey: 'industryPublic' as const },
    { value: 'office', labelKey: 'industryOffice' as const },
    { value: 'entertainment', labelKey: 'industryEntertainment' as const },
    { value: 'events', labelKey: 'industryEvents' as const },
    { value: 'other', labelKey: 'industryOther' as const },
  ];

  const spaceOptions = [
    { value: 'retail', labelKey: 'spaceRetail' as const },
    { value: 'public', labelKey: 'spacePublic' as const },
    { value: 'office', labelKey: 'spaceOffice' as const },
    { value: 'venue', labelKey: 'spaceVenue' as const },
    { value: 'other', labelKey: 'spaceOther' as const },
  ];

  return (
    <section id="partner" className="bg-white section-padding section-divider">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            <span className="text-label mb-4 block">
              {tr('partner', 'overline')}
            </span>
            <JpH2 className="text-[var(--color-navy)] mb-6">
              {tr('partner', 'heading')}
            </JpH2>
            <p className="text-lg text-[var(--color-text-muted)] mb-10">
              {tr('partner', 'body')}
            </p>

            <div className="space-y-5">
              {bullets.map((key) => (
                <div key={key} className="flex gap-4">
                  <CheckCircle2 className="text-[var(--color-sky)] shrink-0 mt-0.5" size={20} strokeWidth={2} />
                  <p className="font-medium">{tr('partner', key)}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-8 md:p-10 rounded-sm border border-[var(--color-mist)] animate-in fade-in duration-1000 delay-300 fill-mode-both"
            style={{ background: 'var(--color-sky-wash)' }}
          >
            {formStatus === 'success' ? (
              <div
                className="flex flex-col items-start gap-4 py-6"
                data-testid="partner-success-banner"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600 shrink-0" size={28} strokeWidth={2} />
                  <h3 className="text-lg font-bold text-[var(--color-navy)]">
                    {tr('partner', 'successTitle')}
                  </h3>
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {tr('partner', 'successBody')}
                </p>
              </div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formCompany')}</FormLabel>
                      <FormControl>
                        <Input className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] rounded-sm" {...field} data-testid="input-partner-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formIndustry')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus:ring-[var(--color-sky)] rounded-sm" data-testid="select-partner-industry">
                              <SelectValue placeholder={tr('partner', 'formSelect')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {tr('partner', opt.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spaceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formSpaceType')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus:ring-[var(--color-sky)] rounded-sm" data-testid="select-partner-space">
                              <SelectValue placeholder={tr('partner', 'formSelect')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {spaceOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {tr('partner', opt.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formLocation')}</FormLabel>
                        <FormControl>
                          <Input className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] rounded-sm" {...field} data-testid="input-partner-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footfall"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formFootfall')}</FormLabel>
                        <FormControl>
                          <Input className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] rounded-sm" {...field} data-testid="input-partner-footfall" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formContact')}</FormLabel>
                        <FormControl>
                          <Input className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] rounded-sm" {...field} data-testid="input-partner-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] rounded-sm" {...field} data-testid="input-partner-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--color-navy)] text-xs font-semibold tracking-wider uppercase">{tr('partner', 'formMessage')}</FormLabel>
                      <FormControl>
                        <Textarea className="bg-white border-[var(--color-mist)] text-[var(--color-navy)] focus-visible:ring-[var(--color-sky)] resize-none rounded-sm" rows={3} {...field} data-testid="input-partner-message" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formStatus === 'error' && (
                  <div
                    className="flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3"
                    data-testid="partner-error-banner"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} strokeWidth={2} />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-red-700">{tr('partner', 'errorTitle')}</p>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {tr('partner', 'errorBody')}{' '}
                        <a
                          href={`mailto:${tr('partner', 'errorEmail')}`}
                          className="font-semibold underline underline-offset-2"
                        >
                          {tr('partner', 'errorEmail')}
                        </a>
                      </p>
                      <button
                        type="button"
                        onClick={() => setFormStatus('idle')}
                        className="mt-1 self-start text-xs font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
                      >
                        {tr('partner', 'errorRetry')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex flex-col items-start gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[var(--color-sky)] text-white hover:bg-[var(--color-sky)]/90 font-bold px-8 py-3 text-base w-full md:w-auto rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    data-testid="button-partner-submit"
                  >
                    {submitting ? 'Sending…' : tr('partner', 'ctaPrimary')}
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
