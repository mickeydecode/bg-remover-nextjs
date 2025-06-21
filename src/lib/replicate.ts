
/**
 * Replicate API helper for background removal using u2net model
 * 
 * To use this, you'll need to:
 * 1. Sign up at https://replicate.com
 * 2. Get your API token
 * 3. Add it to your environment variables or use the browser storage approach below
 */

export interface ReplicateResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
}

/**
 * Remove background using Replicate's u2net model
 * @param imageFile - The image file to process
 * @param apiToken - Replicate API token
 * @returns Promise with the processed image URL
 */
export async function removeBackgroundWithReplicate(
  imageFile: File,
  apiToken: string
): Promise<string> {
  try {
    console.log('Starting background removal with Replicate...');
    
    // Convert file to base64 data URL
    const base64Image = await fileToBase64(imageFile);
    
    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'e4a30157c2a6f43ea49e29e1fec5618b75b40af3e3dee8e0ba5c13cd7568daf8', // u2net model
        input: {
          image: base64Image
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
    }

    const prediction = await response.json() as ReplicateResponse;
    console.log('Prediction created:', prediction.id);

    // Poll for completion
    return await pollForCompletion(prediction.id, apiToken);
  } catch (error) {
    console.error('Error with Replicate API:', error);
    throw error;
  }
}

/**
 * Poll Replicate API until prediction is complete
 */
async function pollForCompletion(predictionId: string, apiToken: string): Promise<string> {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check prediction status: ${response.status}`);
    }

    const prediction = await response.json() as ReplicateResponse;
    console.log(`Prediction status: ${prediction.status}`);

    if (prediction.status === 'succeeded' && prediction.output && prediction.output[0]) {
      return prediction.output[0];
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    }

    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Prediction timed out');
}

/**
 * Convert File to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get API token from localStorage or prompt user
 */
export function getReplicateApiToken(): string | null {
  const token = localStorage.getItem('replicate_api_token');
  if (!token) {
    const userToken = prompt(
      'Please enter your Replicate API token.\n\n' +
      'Get one at: https://replicate.com/account/api-tokens\n\n' +
      'Your token will be stored locally in your browser.'
    );
    
    if (userToken) {
      localStorage.setItem('replicate_api_token', userToken.trim());
      return userToken.trim();
    }
    return null;
  }
  return token;
}

/**
 * Clear stored API token
 */
export function clearApiToken(): void {
  localStorage.removeItem('replicate_api_token');
}
