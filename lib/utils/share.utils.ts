/**
 * Utilities for sharing property details with privacy constraints.
 */

interface PropertyConfig {
  property_type?: string;
  category?: string;
  bhk?: string;
  super_built_up?: string;
  built_up?: string;
  carpet_area?: string;
  price_per_sqft?: string;
  facing?: string;
  total_floors?: string;
  current_floor?: string;
  kattha?: string;
}

function composePropertyMessage(property: any, config: PropertyConfig): string {
  let message = `🏢 *${config.property_type || 'Property'} for ${property.type}*\n`;
  message += `📍 ${config.category || 'Listing'} at ${property.address.split(',')[0]}...\n\n`; // Only first part of address for privacy
  
  if (config.bhk) message += `🛏️ *Configuration:* ${config.bhk} BHK\n`;
  
  const area = config.super_built_up || property.size;
  if (area) message += `📐 *Area:* ${area} sqft\n`;
  if (config.kattha) message += `🌿 *Land Area:* ${config.kattha} Kattha\n`;
  
  message += `💰 *Total Price:* ₹${property.price.toLocaleString('en-IN')}\n`;
  if (config.price_per_sqft) message += `📈 *Rate:* ₹${config.price_per_sqft}/sqft\n`;
  
  if (config.facing) message += `🧭 *Facing:* ${config.facing}\n`;
  
  if (config.total_floors) {
    const floor = config.current_floor || '0';
    message += `🏢 *Floor:* ${floor}/${config.total_floors}\n`;
  }

  if (property.description) {
    message += `\n📝 *Details:*\n${property.description}\n`;
  }

  message += `\n✨ _Shared via SS Real Estate Manager_`;
  return message;
}

export async function sharePropertyDetails(property: any) {
  const config: PropertyConfig = property.configuration || {};
  const message = composePropertyMessage(property, config);

  // 2. Fetch Images as Blobs for Stack Sharing
  const images: { image_url: string }[] = property.property_images || [];
  const files: File[] = [];

  if (navigator.share) {
    try {
      // Fetch up to 10 images for performance
      const imagesToShare = images.slice(0, 10);
      
      for (let i = 0; i < imagesToShare.length; i++) {
        const response = await fetch(imagesToShare[i].image_url);
        const blob = await response.blob();
        const file = new File([blob], `property-image-${i+1}.jpg`, { type: 'image/jpeg' });
        files.push(file);
      }

      // 3. Trigger Native Share
      const shareData: ShareData = {
        title: `${config.property_type || 'Property'} Details`,
        text: message,
      };

      // Check if file sharing is supported
      if (navigator.canShare && navigator.canShare({ files })) {
        shareData.files = files;
      }

      await navigator.share(shareData);
      return { success: true };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Sharing failed:', error);
        // Fallback to text-only if images fail
        try {
          await navigator.share({
            title: `${config.property_type || 'Property'} Details`,
            text: message,
          });
          return { success: true, textOnly: true };
        } catch (e) {
          return { success: false, error: 'Sharing failed' };
        }
      }
      return { success: false, cancelled: true };
    }
  } else {
    // Desktop Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(message);
      return { success: true, copied: true };
    } catch (e) {
      return { success: false, error: 'Sharing not supported on this device' };
    }
  }
}

/**
 * Generate WhatsApp share link for property with images/videos
 * Opens WhatsApp with pre-filled property details message
 */
export function shareToWhatsApp(property: any) {
  const config: PropertyConfig = property.configuration || {};
  const message = composePropertyMessage(property, config);
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // WhatsApp API link format
  const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
  
  // Open WhatsApp (works on mobile, opens web on desktop)
  window.open(whatsappLink, '_blank');
  
  return { success: true, opened: true };
}

/**
 * Share property images/videos with caption to WhatsApp
 * For mobile devices, opens WhatsApp and allows user to select images
 */
export function shareMediaToWhatsApp(property: any) {
  const config: PropertyConfig = property.configuration || {};
  const images: { image_url: string }[] = property.property_images || [];
  const videos: { video_url: string }[] = property.property_videos || [];
  
  // Compose media-focused message
  let message = `🏢 *${config.property_type || 'Property'} for ${property.type}*\n`;
  message += `📍 ${config.category || 'Listing'}\n`;
  message += `💰 ₹${property.price.toLocaleString('en-IN')}\n`;
  
  if (images.length > 0) {
    message += `📸 ${images.length} photos • `;
  }
  if (videos.length > 0) {
    message += `🎥 ${videos.length} videos`;
  }
  
  message += `\n\n✨ View full details at SS Property Manager`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappLink, '_blank');
  
  return { success: true, mediaCount: images.length + videos.length };
}

/**
 * Copy property share link to clipboard
 * Useful for sharing via WhatsApp, email, or other platforms
 */
export function copyPropertyShareLink(property: any): { success: boolean; link?: string } {
  const config: PropertyConfig = property.configuration || {};
  const message = composePropertyMessage(property, config);
  
  try {
    // Create a text that can be easily shared
    navigator.clipboard.writeText(message);
    return { success: true, link: message };
  } catch (e) {
    console.error('Failed to copy:', e);
    return { success: false };
  }
}
