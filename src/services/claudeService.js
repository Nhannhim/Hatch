// Claude API Service
// Shared wrapper for making calls to Anthropic Claude API

export class ClaudeService {
  static API_URL = "https://api.anthropic.com/v1/messages";
  static DEFAULT_MODEL = "claude-sonnet-4-20250514";
  static API_VERSION = "2023-06-01";

  /**
   * Make a call to Claude API
   * @param {Object} options - API call options
   * @param {string} options.model - Model to use (default: claude-sonnet-4-20250514)
   * @param {Array} options.messages - Message history
   * @param {string} options.system - System prompt
   * @param {number} options.max_tokens - Max tokens to generate (default: 1000)
   * @param {number} options.temperature - Temperature 0-1 (default: 1)
   * @param {boolean} options.stream - Enable streaming (default: false)
   * @returns {Promise<Object>} - Claude API response
   */
  static async call({
    model = this.DEFAULT_MODEL,
    messages,
    system,
    max_tokens = 1000,
    temperature = 1,
    stream = false
  }) {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('VITE_ANTHROPIC_API_KEY environment variable is not set');
    }

    const requestBody = {
      model,
      max_tokens,
      messages
    };

    if (system) {
      requestBody.system = system;
    }

    if (temperature !== 1) {
      requestBody.temperature = temperature;
    }

    if (stream) {
      requestBody.stream = true;
    }

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": this.API_VERSION,
          "x-api-key": apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errorText}`);
      }

      if (stream) {
        return response; // Return response for streaming
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  /**
   * Extract text content from Claude response
   * @param {Object} response - Claude API response
   * @returns {string} - Extracted text
   */
  static extractText(response) {
    if (!response || !response.content || response.content.length === 0) {
      return '';
    }

    // Find first text content block
    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock ? textBlock.text : '';
  }

  /**
   * Parse JSON from Claude response
   * Handles code blocks and raw JSON
   * @param {Object} response - Claude API response
   * @returns {Object|null} - Parsed JSON or null
   */
  static parseJSON(response) {
    const text = this.extractText(response);

    if (!text) {
      return null;
    }

    try {
      // Try to find JSON in code blocks first
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }

      // Try to find JSON array or object
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try parsing entire text as JSON
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON from Claude response:', error);
      console.log('Response text:', text);
      return null;
    }
  }

  /**
   * Simple call with just a prompt (for quick queries)
   * @param {string} prompt - User prompt
   * @param {string} systemPrompt - System prompt (optional)
   * @param {number} maxTokens - Max tokens (default: 1000)
   * @returns {Promise<string>} - Response text
   */
  static async quickCall(prompt, systemPrompt = null, maxTokens = 1000) {
    const messages = [{ role: 'user', content: prompt }];

    const options = {
      messages,
      max_tokens: maxTokens
    };

    if (systemPrompt) {
      options.system = systemPrompt;
    }

    const response = await this.call(options);
    return this.extractText(response);
  }

  /**
   * Calculate estimated cost for a request
   * Based on Claude Sonnet 4 pricing: $3/1M input tokens, $15/1M output tokens
   * @param {number} inputTokens - Estimated input tokens
   * @param {number} outputTokens - Estimated output tokens
   * @returns {number} - Estimated cost in dollars
   */
  static estimateCost(inputTokens, outputTokens) {
    const INPUT_COST_PER_TOKEN = 3 / 1000000; // $3 per 1M tokens
    const OUTPUT_COST_PER_TOKEN = 15 / 1000000; // $15 per 1M tokens

    return (inputTokens * INPUT_COST_PER_TOKEN) + (outputTokens * OUTPUT_COST_PER_TOKEN);
  }

  /**
   * Rough token count estimation (4 chars ≈ 1 token)
   * @param {string} text - Text to estimate
   * @returns {number} - Estimated token count
   */
  static estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
}
