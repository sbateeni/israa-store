"use client"

import { useLocale } from "@/contexts/locale-provider";

export default function AboutSection() {
    const { t } = useLocale();

    return (
        <section id="about" className="text-center">
            <h2 className="text-3xl font-headline font-bold">{t('about.title')}</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">{t('about.text')}</p>
        </section>
    )
}
