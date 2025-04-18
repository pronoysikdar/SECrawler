'use server';
import {parse} from 'node-html-parser';

/**
 * Represents the scraped content of a SEC filing.
 */
export interface SecFiling {
  /**
   * The text content of the SEC filing.
   */
  textContent: string;
}

/**
 * Asynchronously retrieves the content of an SEC filing from a given URL.
 *
 * @param url The URL of the SEC filing.
 * @returns A promise that resolves to a SecFiling object containing the text content.
 */
export async function getSecFilingContent(url: string): Promise<SecFiling> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const root = parse(html);
    const textContent = root.text;

    return {
      textContent: textContent,
    };
  } catch (error: any) {
    console.error("Failed to scrape SEC filing content:", error);
    return {
      textContent: `Error: Could not retrieve content from URL. ${error.message}`,
    };
  }
}

