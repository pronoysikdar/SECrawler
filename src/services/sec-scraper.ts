'use server';
import {parse} from 'node-html-parser';

/**
 * Represents the scraped content of a SEC filing.
 */
export interface SecFiling {
  /**
   * The text content of the SEC filing, with tables demarcated.
   */
  textContent: string;
}

/**
 * Asynchronously retrieves the content of an SEC filing from a given URL,
 * adding separators around the text content derived from HTML tables.
 *
 * @param url The URL of the SEC filing.
 * @returns A promise that resolves to a SecFiling object containing the text content.
 */
export async function getSecFilingContent(url: string): Promise<SecFiling> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Alok (aloksik@gmail.com)' // The User-Agent that worked
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let html = await response.text();

    // Add separators around table tags in the raw HTML string
    // Using case-insensitive regex for replacement
    const tableStartSeparator = `
======== TABLE START ======== 
`;
    const tableEndSeparator = `
========= TABLE END =========
`;
    html = html.replace(/<table/gi, tableStartSeparator + '<table');
    html = html.replace(/<\/table>/gi, '</table>' + tableEndSeparator);

    // Parse the MODIFIED HTML
    const root = parse(html);
    // Extract text content. The separators will be included in the text output.
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

