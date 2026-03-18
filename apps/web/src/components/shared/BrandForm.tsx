'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const brandFormSchema = z.object({
  brandName: z.string().min(1, { message: 'Brand name is required.' }),
  industry: z.string().min(1, { message: 'Industry is required.' }),
  searchContext: z.string().optional(),
  competitors: z.array(
    z.object({
      name: z.string().min(1, { message: 'Competitor name cannot be empty.' }),
    }),
  ),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

export function BrandForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      brandName: '',
      industry: '',
      searchContext: '',
      competitors: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'competitors',
  });

  async function onSubmit(data: BrandFormValues) {
    setIsSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Authentication error', {
        description: 'You must be logged in to create a brand.',
      });
      setIsSubmitting(false);
      return;
    }

    console.log(process.env.NEXT_PUBLIC_API_URL);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/brands`;
    const payload = {
      name: data.brandName,
      industry: data.industry,
      // search_context: data.searchContext,
      competitors: data.competitors.map((c) => c.name).filter(Boolean), // a competitor can be an empty string
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit brand data.');
      }

      toast.success('Analysis started!', {
        description: 'Your brand analysis is underway. We will notify you upon completion.',
      });
      form.reset();
    } catch (error) {
      toast.error('Submission failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="brandName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="B2B SaaS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="searchContext"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Context</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'project management tools for small businesses'"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide context to help the AI understand your brand's niche.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Competitors</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`competitors.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input {...field} placeholder={`Competitor #${index + 1}`} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ name: '' })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
        </Button>
      </form>
    </Form>
  );
}
