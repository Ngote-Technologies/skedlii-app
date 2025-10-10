import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "../../ui/button";
import { ArrowLeft } from "lucide-react";

const HelpArticlePage = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    const articles = import.meta.glob("./**/*.md");

    const loadArticle = async () => {
      const path = `./${articleId}.md`;
      const loader = articles[path];

      if (!loader) {
        setMarkdown(
          `# Article not found\n\nWe couldn’t find help content for "${articleId}".`
        );
        return;
      }

      try {
        const mod: any = await loader();
        const response = await fetch(mod.default);
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        console.error(err);
        setMarkdown(
          `# Article load failed\n\nSomething went wrong while loading "${articleId}".`
        );
      }
    };

    loadArticle();
  }, [articleId]);

  return (
    <div className="prose prose-sm dark:prose-invert space-y-10 mt-10">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/help")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default HelpArticlePage;
