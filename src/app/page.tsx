"use client";

import { useState, useRef } from "react";
import { getSecFilingContent } from "@/services/sec-scraper";
import { summarizeSecFiling } from "@/ai/flows/summarize-sec-filing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Label } from "@/components/ui/label";   // Import Label

export default function Home() {
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generateSummaryEnabled, setGenerateSummaryEnabled] = useState(false); // State for the toggle
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScrape = async () => {
    setIsLoading(true);
    setTextContent(null);
    setSummary(null); // Reset summary
    let scrapeSuccessful = false;
    try {
      const filing = await getSecFilingContent(url);
      setTextContent(filing.textContent);
      scrapeSuccessful = true; // Mark scrape as successful

      // Only generate summary if the toggle is enabled
      if (generateSummaryEnabled) {
        // The flow now returns an object { summary: "..." }
        const summaryResult = await summarizeSecFiling({ url });
        // Access the .summary property
        setSummary(summaryResult.summary);
      } else {
        setSummary(null); // Ensure summary is null if toggle is off
      }

    } catch (error: any) {
      console.error("Error scraping or summarizing:", error);
      toast({
        title: "Error",
        description: `Failed to process request: ${error.message}`,
        variant: "destructive",
      });
      // If scrape failed, show error in textContent
      if (!scrapeSuccessful) {
         setTextContent(`Error scraping content: ${error.message}`);
      }
      // If scrape was successful BUT summary was enabled and failed, show error in summary box
      else if (generateSummaryEnabled) {
        setSummary(`Error generating summary: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTextFile = () => {
    if (!textContent || textContent.startsWith('Error')) return;

    // Extract filename from URL
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1] || 'sec_filing_content'; // Get last segment or default

    // Remove extension and add .txt
    filename = filename.replace(/\.[^/.]+$/, "") + ".txt"; // Strip file extension

    const blob = new Blob([textContent], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename; // Set dynamically
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  // Function to download the summary
  const downloadSummaryFile = () => {
    if (!summary || summary.startsWith('Error')) return;

    // Extract base filename from URL
    const urlParts = url.split('/');
    let baseFilename = urlParts[urlParts.length - 1] || 'sec_filing'; // Get last segment or default
    baseFilename = baseFilename.replace(/\.[^/.]+$/, ""); // Strip file extension

    // Hardcode the model name (replace '/' with '_')
    const modelName = "googleai_gemini-2.0-flash"; 

    // Construct the final filename
    const filename = `${baseFilename}_${modelName}_AI_Summary.txt`; 

    const blob = new Blob([summary], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename; // Set dynamically
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };


  return (
    <div className="flex flex-col justify-start min-h-screen bg-background p-4">
      <Toaster />
      <Card className="w-full shadow-md flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">SECrawler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          {/* Single row for most controls */}
          <div className="flex items-center space-x-2">
            <Input
              type="url"
              placeholder="Enter SEC Filing URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            {/* Toggle Switch for Summary */}
            <div className="flex items-center space-x-2">
              <Switch
                id="summary-toggle"
                checked={generateSummaryEnabled}
                onCheckedChange={setGenerateSummaryEnabled}
                disabled={isLoading}
              />
              <Label htmlFor="summary-toggle">Summarize</Label>
            </div>
            <Button size="sm" onClick={handleScrape} disabled={isLoading || !url}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Scrape"
              )}
            </Button>
            <Button size="sm" onClick={downloadTextFile} disabled={!textContent || textContent.startsWith('Error')}>
              Download Content
            </Button>
            {/* Download Summary Button REMOVED from here */}
          </div>

          {/* Content area below the controls */}
          <div className="flex flex-col space-y-4 flex-grow min-h-0">
            {textContent && (
              <div className="space-y-2 flex flex-col flex-grow min-h-0">
                <h3 className="text-md font-semibold">Scraped Content:</h3>
                <Textarea
                  ref={textareaRef}
                  readOnly
                  value={textContent}
                  className="flex-grow bg-muted min-h-[300px] lg:min-h-[500px]"
                  placeholder="Scraped content will appear here..."
                />
              </div>
            )}
            {summary && (
              <div className="space-y-2 pt-4 border-t">
                 {/* Container for Heading and Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold">AI Summary:</h3>
                  {/* Download Summary Button - Removed variant="outline" */}
                  <Button size="sm" onClick={downloadSummaryFile} disabled={!summary || summary.startsWith('Error')}>
                    <Icons.download className="mr-2 h-4 w-4" /> {/* Optional: Add icon */}
                    Download Summary
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={summary}
                  className="min-h-[150px] bg-muted"
                />
              </div>
            )}
            {!isLoading && !textContent && !summary && (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Enter a URL, choose whether to summarize, and click 'Scrape'.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
