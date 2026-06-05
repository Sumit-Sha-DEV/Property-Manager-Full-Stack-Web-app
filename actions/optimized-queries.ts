'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Optimized database queries with selective field selection
 * Reduces payload size and improves query performance
 */

export interface PropertyListItem {
  id: string
  owner_name: string
  owner_phone: string
  type: 'Rent' | 'Sale'
  price: number
  address: string
  configuration: Record<string, any>
  property_images: Array<{ image_url: string }>
  property_videos: Array<{ video_url: string; duration_seconds: number | null }>
  created_at: string
}

export interface PropertyDetail {
  id: string
  owner_name: string
  owner_phone: string
  type: 'Rent' | 'Sale'
  price: number
  address: string
  google_map_link: string | null
  description: string | null
  configuration: Record<string, any>
  property_images: Array<{ image_url: string }>
  property_videos: Array<{ video_url: string; duration_seconds: number | null }>
  created_at: string
  updated_at: string
}

export interface ClientListItem {
  id: string
  name: string
  phone: string
  requirement: 'Rent' | 'Buy'
  budget: number
  created_at: string
}

export interface ClientDetail {
  id: string
  name: string
  phone: string
  requirement: 'Rent' | 'Buy'
  budget: number
  preferred_locations: string[]
  configuration: Record<string, any>
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Get properties list with pagination (optimized query)
 * Only selects necessary fields for list view
 */
export async function getPropertiesList(
  limit: number = 20,
  offset: number = 0
): Promise<{ data: PropertyListItem[]; total: number; error: any }> {
  const supabase = await createClient()

  try {
    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })

    if (countError) throw countError

    // Fetch properties with selective fields
    const { data, error } = await supabase
      .from('properties')
      .select(
        `id, 
         owner_name, 
         owner_phone,
         type, 
         price, 
         address, 
         configuration, 
         created_at,
         property_images(image_url),
         property_videos(video_url, duration_seconds)`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { data: data as PropertyListItem[], total: count || 0, error: null }
  } catch (error) {
    console.error('Failed to fetch properties list:', error)
    return { data: [], total: 0, error }
  }
}

/**
 * Get single property with all details (optimized query)
 */
export async function getPropertyDetail(
  id: string
): Promise<{ data: PropertyDetail | null; error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `id,
         owner_name,
         owner_phone,
         type,
         price,
         address,
         google_map_link,
         description,
         configuration,
         created_at,
         updated_at,
         property_images(image_url),
         property_videos(video_url, duration_seconds)`
      )
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: data as PropertyDetail, error: null }
  } catch (error) {
    console.error('Failed to fetch property detail:', error)
    return { data: null, error }
  }
}

/**
 * Get clients list with pagination (optimized query)
 */
export async function getClientsList(
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ClientListItem[]; total: number; error: any }> {
  const supabase = await createClient()

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })

    if (countError) throw countError

    // Fetch clients with selective fields
    const { data, error } = await supabase
      .from('clients')
      .select(
        `id,
         name,
         phone,
         requirement,
         budget,
         created_at`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { data: data as ClientListItem[], total: count || 0, error: null }
  } catch (error) {
    console.error('Failed to fetch clients list:', error)
    return { data: [], total: 0, error }
  }
}

/**
 * Get single client with all details (optimized query)
 */
export async function getClientDetail(
  id: string
): Promise<{ data: ClientDetail | null; error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('clients')
      .select(
        `id,
         name,
         phone,
         requirement,
         budget,
         preferred_locations,
         configuration,
         notes,
         created_at,
         updated_at`
      )
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: data as ClientDetail, error: null }
  } catch (error) {
    console.error('Failed to fetch client detail:', error)
    return { data: null, error }
  }
}

/**
 * Batch fetch property details (reduces N+1 queries)
 */
export async function getPropertiesDetailBatch(
  ids: string[]
): Promise<{ data: PropertyDetail[]; error: any }> {
  if (ids.length === 0) return { data: [], error: null }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `id,
         owner_name,
         owner_phone,
         type,
         price,
         address,
         google_map_link,
         description,
         configuration,
         created_at,
         updated_at,
         property_images(image_url),
         property_videos(video_url, duration_seconds)`
      )
      .in('id', ids)

    if (error) throw error

    return { data: data as PropertyDetail[], error: null }
  } catch (error) {
    console.error('Failed to batch fetch properties:', error)
    return { data: [], error }
  }
}
