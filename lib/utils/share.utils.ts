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

export async function sharePropertyDetails(property: any) {
  const config: PropertyConfig = property.configuration || {};
  
  // 1. Compose the professional message (Privacy-First)
  // Excludes: owner_name, owner_phone, google_map_link
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
    // Desktop Fallback: Copy to clipboard?
    try {
      await navigator.clipboard.writeText(message);
      return { success: true, copied: true };
    } catch (e) {
      return { success: false, error: 'Sharing not supported on this device' };
    }
  }
}
