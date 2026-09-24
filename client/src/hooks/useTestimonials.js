import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => api.get('/testimonials'),
    staleTime: 0,
  })
}
