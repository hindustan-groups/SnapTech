import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'

// ── Public Queries & Mutations ─────────────────────────────────

export function useActiveJobs() {
  return useQuery({
    queryKey: ['careers', 'active'],
    queryFn: () => api.get('/careers'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useJobDetail(slug) {
  return useQuery({
    queryKey: ['careers', 'detail', slug],
    queryFn: () => api.get(`/careers/${slug}`),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  })
}

export function useApplyJob(slug) {
  return useMutation({
    mutationFn: (formData) => {
      return api.post(`/careers/${slug}/apply`, formData)
    },
  })
}

// ── Admin Queries & Mutations ──────────────────────────────────

export function useAdminJobs() {
  return useQuery({
    queryKey: ['admin', 'careers'],
    queryFn: () => api.get('/admin/careers'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobData) => api.post('/admin/careers', jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'careers'] })
      queryClient.invalidateQueries({ queryKey: ['careers', 'active'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...jobData }) => api.patch(`/admin/careers/${id}`, jobData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'careers'] })
      queryClient.invalidateQueries({ queryKey: ['careers', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['careers', 'detail', variables.slug] })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/careers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'careers'] })
      queryClient.invalidateQueries({ queryKey: ['careers', 'active'] })
    },
  })
}

export function useAdminApplications(filters = {}) {
  const params = new URLSearchParams()
  if (filters.jobPostingId) params.set('jobPostingId', filters.jobPostingId)
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()

  return useQuery({
    queryKey: ['admin', 'applications', filters],
    queryFn: () => api.get(`/admin/applications${qs ? `?${qs}` : ''}`),
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, adminNotes, rating }) =>
      api.patch(`/admin/applications/${id}/status`, { status, adminNotes, rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
    },
  })
}
