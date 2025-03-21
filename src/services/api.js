import axios from 'axios';

const API_URL = 'https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete';

/**
 * @typedef {Object} AutocompleteSuggestion
 * @property {string} value - The suggestion value
 */

/**
 * Fetches autocomplete suggestions from the API
 * @param {string} query - The search query
 * @returns {Promise<AutocompleteSuggestion[]>}
 * @throws {Error} When the API request fails
 */
export const getSuggestions = async (query) => {
  try {
    const response = await axios.get(API_URL, {
      params: { search: query },
      timeout: 5000, // 5 second timeout
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out');
      }
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
    console.error('Error fetching suggestions:', error);
    throw error;
  }
}; 