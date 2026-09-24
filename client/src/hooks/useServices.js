import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/services'),
    staleTime: 0,
  })
}

export function useService(slug) {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: () => api.get(`/services/${slug}`),
    enabled: Boolean(slug),
    staleTime: 0,
  })
}
