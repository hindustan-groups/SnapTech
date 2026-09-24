import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useProjects(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.featured) params.set('featured', 'true')
  const qs = params.toString()

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.get(`/projects${qs ? `?${qs}` : ''}`),
    staleTime: 0,
  })
}

export function useProject(slug) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => api.get(`/projects/${slug}`),
    enabled: Boolean(slug),
    staleTime: 0,
  })
}
