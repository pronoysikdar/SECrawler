"use client";

import { useState } from "react";
import { getSecFilingContent } from "@/services/sec-scraper";
import { summarizeSecFiling } from "@/ai/flows/summarize-sec-filing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    setIsLoading(true);
    setTextContent(null);
    setSummary(null);
    try {
      const filing = await getSecFilingContent(url);
      setTextContent(filing.textContent);

      const summaryResult = await summarizeSecFiling({ url });
      setSummary(summaryResult.summary);
    } catch (error: any) {
      console.error("Error scraping or summarizing:", error);
      toast({
        title: "Error",
        description: "Failed to scrape or summarize content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-8">
      <Toaster />
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">SECrawler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="Enter SEC Filing URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleScrape} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Scrape & Summarize"
              )}
            </Button>
          </div>

          {textContent && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold">Scraped Content:</h3>
              <Textarea
                readOnly
                value={textContent}
                className="min-h-[200px] bg-muted"
              />
            </div>
          )}

          {summary && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold">AI Summary:</h3>
              <Textarea
                readOnly
                value={summary}
                className="min-h-[100px] bg-muted"
              />
            </div>
          )}

          {!isLoading && !textContent && (
            <p className="text-muted-foreground">
              Enter a URL to scrape and summarize SEC filing content.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
