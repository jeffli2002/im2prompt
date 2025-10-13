import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslations, useMessages, useLocale } from 'next-intl';
import Image from 'next/image';

interface TranslationFaqItem {
  question: string;
  answer: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}



const Faq = () => {
  const faqData = useTranslations('faq');
  const messages = useMessages();
  const locale = useLocale();
  // Get data from i18n
  const heading = faqData('heading');
  const description = faqData('description');
  const supportHeading = faqData('supportHeading');
  const supportDescription = faqData('supportDescription');
  const supportButtonText = faqData('supportButtonText');
  const supportButtonUrl = `/${locale}/support`;

  // Get FAQ items from i18n
  const faqMessages = messages as { faq?: { items?: TranslationFaqItem[] } };
  const items: FaqItem[] = (faqMessages?.faq?.items || []).map((item: TranslationFaqItem, index: number) => ({
    ...item,
    id: `faq-${index + 1}`,
  }));
  return (
    <section className="py-16">
      <div className="container space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 font-semibold text-3xl md:mb-4 lg:mb-6 lg:text-4xl">{heading}</h2>
          <p className="text-muted-foreground lg:text-lg">{description}</p>
        </div>
        <Accordion type="single" collapsible className="mx-auto w-full lg:max-w-3xl">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                <div className="font-medium sm:py-1 lg:py-2 lg:text-lg">{item.question}</div>
              </AccordionTrigger>
              <AccordionContent className="sm:mb-1 lg:mb-2">
                <div className="text-muted-foreground lg:text-lg">{item.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-lg bg-accent p-4 text-center md:rounded-xl md:p-6 lg:p-8">
          <div className="relative mb-4 md:mb-5">
            <div className="-translate-x-[60%] absolute size-16 origin-bottom scale-[80%] rounded-full border bg-white overflow-hidden">
              <Image src="/avatar/2.png" alt="Support" width={64} height={64} className="object-cover" />
            </div>
            <div className="absolute size-16 origin-bottom translate-x-[60%] scale-[80%] rounded-full border bg-white overflow-hidden">
              <Image src="/avatar/4.png" alt="Support" width={64} height={64} className="object-cover" />
            </div>
            <div className="size-16 rounded-full border bg-white overflow-hidden">
              <Image src="/avatar/5.png" alt="Support" width={64} height={64} className="object-cover" />
            </div>
          </div>
          <h3 className="mb-2 max-w-3xl font-semibold lg:text-lg">{supportHeading}</h3>
          <p className="mb-8 max-w-3xl text-muted-foreground lg:text-lg">{supportDescription}</p>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" asChild>
              <a href={supportButtonUrl}>
                {supportButtonText}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Faq };
