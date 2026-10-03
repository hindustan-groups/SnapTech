import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get('/faqs'),
    staleTime: 0,
  })
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      return res
    },
    staleTime: 60 * 1000,
  })
}

export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: () => api.get('/milestones'),
    staleTime: 0,
  })
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: () => api.get('/partners'),
    staleTime: 0,
  })
}

// ── Legal Pages Hooks ──────────────────────────────────────────
export function useLegalPage(pageType) {
  return useQuery({
    queryKey: ['legal-page', pageType],
    queryFn: () => api.get(`/legal/${pageType}`).then((r) => r.data),
    staleTime: 0,
  })
}

export function useAdminLegalPages() {
  return useQuery({
    queryKey: ['admin-legal-pages'],
    queryFn: () => api.get('/admin/legal').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateLegalPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageType, title, content }) =>
      api.put(`/admin/legal/${pageType}`, { title, content }).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-legal-pages'] })
      qc.invalidateQueries({ queryKey: ['legal-page', variables.pageType] })
    },
  })
}

// ── Pricing Packages Hooks ─────────────────────────────────────
export function usePricingPackages(category) {
  return useQuery({
    queryKey: ['pricing-packages', category || 'all'],
    queryFn: () => {
      const url = category ? `/pricing?category=${category}` : '/pricing'
      return api.get(url).then((r) => r.data)
    },
    staleTime: 60 * 1000,
  })
}

export function useAdminPricing() {
  return useQuery({
    queryKey: ['admin-pricing'],
    queryFn: () => api.get('/admin/pricing').then((r) => r.data),
    staleTime: 0,
  })
}

export function useCreatePricingPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/admin/pricing', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pricing'] })
      qc.invalidateQueries({ queryKey: ['pricing-packages'] })
    },
  })
}

export function useUpdatePricingPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/pricing/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pricing'] })
      qc.invalidateQueries({ queryKey: ['pricing-packages'] })
    },
  })
}

export function useBulkUpdatePricingPackages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (packages) => api.put('/admin/pricing/bulk', { packages }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pricing'] })
      qc.invalidateQueries({ queryKey: ['pricing-packages'] })
    },
  })
}

export function useDeletePricingPackage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/pricing/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pricing'] })
      qc.invalidateQueries({ queryKey: ['pricing-packages'] })
    },
  })
}
