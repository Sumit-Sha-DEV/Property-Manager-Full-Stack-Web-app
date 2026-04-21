'use server'

import { createClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

/** Extract the Cloudinary public_id from a secure_url */
function getCloudinaryPublicId(url: string): string | null {
  try {
    // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/property_manager/abc.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'property_manager' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const owner_name = formData.get('owner_name') as string;
  const owner_phone = formData.get('owner_phone') as string;
  const type = formData.get('type') as string;
  const price = parseFloat(formData.get('price') as string);
  const address = formData.get('address') as string;
  const google_map_link = formData.get('google_map_link') as string;
  const description = formData.get('description') as string;
  
  // Extract all configuration fields
  const configRaw = formData.get('config') as string;
  let configuration = {};
  if (configRaw) {
    try {
      configuration = JSON.parse(configRaw);
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
  }

  const { data: property, error: propError } = await supabase
    .from('properties')
    .insert({
      owner_name,
      owner_phone,
      type,
      price,
      address,
      google_map_link,
      description,
      configuration,
      user_id: user.id
    })
    .select()
    .single();

  if (propError || !property) {
    throw new Error(propError?.message || 'Failed to create property');
  }

  const imageFiles = formData.getAll('images') as File[];
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    if (file.size > 0 && file.type.startsWith('image/')) {
      try {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  }

  if (imageUrls.length > 0) {
    const imageInserts = imageUrls.map(url => ({
      property_id: property.id,
      image_url: url
    }));
    await supabase.from('property_images').insert(imageInserts);
  }

  revalidatePath('/properties');
  return property;
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/properties');
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const owner_name = formData.get('owner_name') as string;
  const owner_phone = formData.get('owner_phone') as string;
  const type = formData.get('type') as string;
  const price = parseFloat(formData.get('price') as string);
  const address = formData.get('address') as string;
  const google_map_link = formData.get('google_map_link') as string;
  const description = formData.get('description') as string;
  
  // Extract all configuration fields
  const configRaw = formData.get('config') as string;
  let configuration = {};
  if (configRaw) {
    try {
      configuration = JSON.parse(configRaw);
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
  }

  const { data: property, error: propError } = await supabase
    .from('properties')
    .update({
      owner_name,
      owner_phone,
      type,
      price,
      address,
      google_map_link,
      description,
      configuration
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (propError || !property) {
    throw new Error(propError?.message || 'Failed to update property');
  }

  // Handle images if provided in edit (Append simple logic, image additions only)
  const imageFiles = formData.getAll('images') as File[];
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    if (file && file.size > 0 && file.type && file.type.startsWith('image/')) {
      try {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  }

  if (imageUrls.length > 0) {
    const imageInserts = imageUrls.map(url => ({
      property_id: property.id,
      image_url: url
    }));
    await supabase.from('property_images').insert(imageInserts);
  }

  // Delete images the user marked for removal
  const imagesToDeleteRaw = formData.get('imagesToDelete') as string;
  if (imagesToDeleteRaw) {
    const urlsToDelete: string[] = JSON.parse(imagesToDeleteRaw);
    if (urlsToDelete.length > 0) {
      // Remove rows from property_images table
      await supabase
        .from('property_images')
        .delete()
        .in('image_url', urlsToDelete)
        .eq('property_id', id);

      // Also delete from Cloudinary to free storage
      for (const url of urlsToDelete) {
        const publicId = getCloudinaryPublicId(url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.error('Cloudinary delete failed for:', publicId, e);
          }
        }
      }
    }
  }

  revalidatePath('/properties');
  revalidatePath(`/properties/${id}`);
  return property;
}
