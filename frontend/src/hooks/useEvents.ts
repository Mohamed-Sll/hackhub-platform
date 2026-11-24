'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CreateEventRequest } from '@/types'

export function useEvents(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => apiClient.events.list(filters),
  })
}

export function useManagedEvents(enabled = true, filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['events', 'managed', filters],
    queryFn: () => apiClient.events.listManaged(filters),
    enabled,
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiClient.events.getById(id),
    enabled: !!id,
  })
}

export function useEventRegistrations(eventId: string, page = 1, size = 25) {
  return useQuery({
    queryKey: ['events', eventId, 'registrations', page, size],
    queryFn: () => apiClient.events.listRegistrations(eventId, page, size),
    enabled: !!eventId,
  })
}

export function useRegisterForEvent(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { full_name: string; email: string }) => apiClient.events.register(eventId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', eventId, 'registrations'] }),
  })
}

export function useDeleteEventRegistration(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) => apiClient.events.deleteRegistration(eventId, registrationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', eventId, 'registrations'] }),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventRequest) => apiClient.events.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventRequest> }) =>
      apiClient.events.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.events.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useChangeEventStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.events.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
