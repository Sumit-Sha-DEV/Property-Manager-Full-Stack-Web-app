'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const requirement = formData.get('requirement') as string;
  const budget = parseFloat(formData.get('budget') as string) || 0;
  const notes = formData.get('notes') as string;
  
  const preferred_locations = formData.get('preferred_locations') 
    ? (formData.get('preferred_locations') as string).split(',').map(s => s.trim())
    : [];

  const configRaw = formData.get('config') as string;
  let configuration = {};
  if (configRaw) {
    try {
      configuration = JSON.parse(configRaw);
    } catch (e) {
      console.error('Failed to parse client config:', e);
    }
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name,
      phone,
      requirement,
      budget,
      preferred_locations,
      notes,
      configuration,
      user_id: user.id
    })
    .select()
    .single();

  if (error || !client) throw new Error(error?.message || 'Failed to create client');

  revalidatePath('/clients');
  return client;
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/clients');
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const requirement = formData.get('requirement') as string;
  const budget = parseFloat(formData.get('budget') as string) || 0;
  const notes = formData.get('notes') as string;
  
  const preferred_locations = formData.get('preferred_locations') 
    ? (formData.get('preferred_locations') as string).split(',').map(s => s.trim())
    : [];

  const configRaw = formData.get('config') as string;
  let configuration = {};
  if (configRaw) {
    try {
      configuration = JSON.parse(configRaw);
    } catch (e) {
      console.error('Failed to parse client config:', e);
    }
  }

  const { data: client, error } = await supabase
    .from('clients')
    .update({
      name,
      phone,
      requirement,
      budget,
      preferred_locations,
      notes,
      configuration,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !client) throw new Error(error?.message || 'Failed to update client');

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return client;
}
