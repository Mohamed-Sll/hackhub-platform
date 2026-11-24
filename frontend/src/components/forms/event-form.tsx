'use client'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { CreateEventRequest } from '@/types'
import { LocalizedText, useI18n } from '@/lib/i18n'

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cover_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  is_online: z.boolean().default(false),
  max_team_size: z.coerce.number().min(1).default(4),
  min_team_size: z.coerce.number().min(1).default(1),
  prizes: z.string().optional(),
  sponsors: z.string().optional(),
  regulations: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  initialData?: Partial<CreateEventRequest>
  onSubmit: (data: CreateEventRequest) => Promise<void>
  isLoading?: boolean
}

export function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
  const { t } = useI18n()
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      cover_image: initialData?.cover_image || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      location: initialData?.location || '',
      is_online: initialData?.is_online || false,
      max_team_size: initialData?.max_team_size || 4,
      min_team_size: initialData?.min_team_size || 1,
      prizes: typeof initialData?.prizes === 'string' ? initialData.prizes : '',
      sponsors: typeof initialData?.sponsors === 'string' ? initialData.sponsors : '',
      regulations: initialData?.regulations || '',
    },
  })

  const isOnline = useWatch({ control, name: 'is_online' })

  const handleFormSubmit = async (data: EventFormData) => {
    await onSubmit({
      title: data.title,
      description: data.description,
      cover_image: data.cover_image || undefined,
      start_date: data.start_date,
      end_date: data.end_date,
      location: isOnline ? undefined : data.location,
      is_online: data.is_online,
      max_team_size: data.max_team_size,
      min_team_size: data.min_team_size,
      prizes: data.prizes ? { description: data.prizes } : undefined,
      sponsors: data.sponsors ? { list: data.sponsors } : undefined,
      regulations: data.regulations || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Event Title"
            placeholder="Enter event title"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-1">
            <label htmlFor="event-description" className="text-sm font-medium"><LocalizedText text="Description" /></label>
            <textarea
              id="event-description"
              aria-invalid={Boolean(errors.description)}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t('Describe the event...')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">{t(errors.description.message || '')}</p>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <Input
            label="Cover Image URL"
            placeholder="https://example.com/image.jpg"
            error={errors.cover_image?.message}
            {...register('cover_image')}
          />
        </div>
        <Input
          label="Start Date"
          type="datetime-local"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="End Date"
          type="datetime-local"
          error={errors.end_date?.message}
          {...register('end_date')}
        />
        <div className="flex items-center gap-2 pt-6">
          <Switch
            id="event-is-online"
            checked={isOnline}
            onCheckedChange={(checked) => setValue('is_online', checked)}
          />
          <label htmlFor="event-is-online" className="text-sm font-medium"><LocalizedText text="Online Event" /></label>
        </div>
        {!isOnline && (
          <Input
            label="Location"
            placeholder="City, Venue"
            error={errors.location?.message}
            {...register('location')}
          />
        )}
        <Input
          label="Min Team Size"
          type="number"
          error={errors.min_team_size?.message}
          {...register('min_team_size')}
        />
        <Input
          label="Max Team Size"
          type="number"
          error={errors.max_team_size?.message}
          {...register('max_team_size')}
        />
        <div className="md:col-span-2">
          <div className="space-y-1">
            <label htmlFor="event-prizes" className="text-sm font-medium"><LocalizedText text="Prizes" /></label>
            <textarea
              id="event-prizes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t('Describe the prizes...')}
              {...register('prizes')}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Input
            label="Sponsors"
            placeholder="List of sponsors"
            error={errors.sponsors?.message}
            {...register('sponsors')}
          />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-1">
            <label htmlFor="event-regulations" className="text-sm font-medium"><LocalizedText text="Regulations" /></label>
            <textarea
              id="event-regulations"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={t('Event regulations...')}
              {...register('regulations')}
            />
          </div>
        </div>
      </div>
      <Button type="submit" loading={isLoading} className="w-full">
        {t(initialData ? 'Update Event' : 'Create Event')}
      </Button>
    </form>
  )
}
