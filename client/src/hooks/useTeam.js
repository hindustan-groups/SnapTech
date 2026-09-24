import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/team'),
    staleTime: 0,
  })
}
