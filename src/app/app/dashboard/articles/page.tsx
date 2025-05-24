'use client';

import {useState, useEffect, ChangeEvent} from 'react';
import {useSession} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {processArticleWithAI, saveArticleToDb, getArticlesFromDb, ArticleToSave} from '@/actions/articles';
import type {ProcessArticleInput, ProcessArticleOutput} from '@/ai/flows/article-processing';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For messages
import { ReloadIcon } from "@radix-ui/react-icons"; // For loading icon

// LocalStorage Article Structure
interface LocalStorageArticle {
  id: string;
  title: string;
  articleText: string;
  userProvidedTranslation?: string;
  sourceUrl?: string;
  aiProcessedData: ProcessArticleOutput;
  createdAt: string;
}

export default function ArticleRepositoryPage() {
  const {data: session, status: sessionStatus} = useSession();

  // Form state
  const [articleTitle, setArticleTitle] = useState('');
  const [articleText, setArticleText] = useState('');
  const [userProvidedTranslation, setUserProvidedTranslation] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [maxNewWords, setMaxNewWords] = useState(10);
  const [maxPhrases, setMaxPhrases] = useState(5);
  const [generateQuestions, setGenerateQuestions] = useState(true);

  // AI Data State - this will hold the editable AI data
  const [editableAiData, setEditableAiData] = useState<ProcessArticleOutput | null>(null);
  
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isImportButtonEnabled, setIsImportButtonEnabled] = useState(false);

  // Article List State
  const [articlesList, setArticlesList] = useState<Partial<Awaited<ReturnType<typeof prisma.article.findMany>>>[] | LocalStorageArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);


  // --- AI Data Change Handlers ---
  const handleAiTranslationChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!editableAiData) return;
    setEditableAiData({...editableAiData, translation: e.target.value});
  };

  const handleNewWordChange = (index: number, field: 'word' | 'translation', value: string) => {
    if (!editableAiData) return;
    const updatedNewWords = [...editableAiData.newWords];
    updatedNewWords[index] = {...updatedNewWords[index], [field]: value};
    setEditableAiData({...editableAiData, newWords: updatedNewWords});
  };

  const handlePhraseChange = (index: number, field: 'phrase' | 'translation' | 'example', value: string) => {
    if (!editableAiData) return;
    const updatedPhrases = [...editableAiData.phrases];
    updatedPhrases[index] = {...updatedPhrases[index], [field]: value};
    setEditableAiData({...editableAiData, phrases: updatedPhrases});
  };

  const handleQuestionChange = (qIndex: number, field: 'question' | 'explanation', value: string) => {
    if (!editableAiData || !editableAiData.readingComprehensionQuestions) return;
    const updatedQuestions = [...editableAiData.readingComprehensionQuestions];
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], [field]: value};
    setEditableAiData({...editableAiData, readingComprehensionQuestions: updatedQuestions});
  };

  const handleOptionChange = (qIndex: number, oIndex: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    if (!editableAiData || !editableAiData.readingComprehensionQuestions) return;
    const updatedQuestions = [...editableAiData.readingComprehensionQuestions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    if (field === 'is_correct') {
        // Ensure only one option is correct
        updatedOptions.forEach((opt, i) => opt.is_correct = (i === oIndex) ? Boolean(value) : false);
    } else {
        updatedOptions[oIndex] = {...updatedOptions[oIndex], [field]: value as string};
    }
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], options: updatedOptions};
    setEditableAiData({...editableAiData, readingComprehensionQuestions: updatedQuestions});
  };


  // --- Core Functions ---
  const handleProcessArticle = async () => {
    setIsLoadingAi(true);
    setError(null);
    setSuccessMessage(null);
    setEditableAiData(null);
    setIsImportButtonEnabled(false);

    if (!articleText.trim()) {
        setError('Article text is required.');
        setIsLoadingAi(false);
        return;
    }

    const input: ProcessArticleInput = {
      articleText,
      maxNewWords: Number(maxNewWords) || 10,
      maxPhrases: Number(maxPhrases) || 5,
      generateReadingComprehensionQuestions: generateQuestions,
    };

    const result = await processArticleWithAI(input);
    setIsLoadingAi(false);

    if (result && 'error' in result) {
      setError(result.error);
    } else if (result) {
      setEditableAiData(result);
      setIsImportButtonEnabled(true);
      setSuccessMessage('AI processing successful. Review and edit below before importing.');
    } else {
      setError('Received no result or an unexpected result from AI processing.');
    }
  };

  const fetchArticles = async () => {
    if (sessionStatus === 'loading') return;
    setIsLoadingArticles(true);
    setError(null);

    try {
        if (session?.user?.role === 'admin') {
            const dbArticles = await getArticlesFromDb();
            if ('error' in dbArticles) {
                setError(dbArticles.error);
                setArticlesList([]);
            } else {
                setArticlesList(dbArticles as Partial<Awaited<ReturnType<typeof prisma.article.findMany>>>[]);
            }
        } else if (session?.user) { // Regular user
            const localArticlesRaw = localStorage.getItem('userArticles');
            if (localArticlesRaw) {
                setArticlesList(JSON.parse(localArticlesRaw) as LocalStorageArticle[]);
            } else {
                setArticlesList([]);
            }
        } else {
             setArticlesList([]); // No session or not logged in
        }
    } catch (e) {
        setError('Failed to fetch articles.');
        console.error("Fetch articles error:", e);
        setArticlesList([]);
    } finally {
        setIsLoadingArticles(false);
    }
  };
  
  useEffect(() => {
    if (sessionStatus !== 'loading') {
        fetchArticles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.role]);


  const handleImportArticle = async () => {
    setIsLoadingImport(true);
    setError(null);
    setSuccessMessage(null);

    if (!articleTitle.trim()) {
        setError('Article title is required for import.');
        setIsLoadingImport(false);
        return;
    }
    if (!editableAiData) {
        setError('No AI processed data to import.');
        setIsLoadingImport(false);
        return;
    }

    const articleToSave: ArticleToSave = {
        title: articleTitle,
        articleText: articleText,
        userProvidedTranslation: userProvidedTranslation,
        sourceUrl: sourceUrl,
        ...editableAiData,
    };

    try {
        if (session?.user?.role === 'admin') {
            const result = await saveArticleToDb(articleToSave);
            if ('error' in result) {
                setError(result.error);
            } else {
                setSuccessMessage(`Article "${result.title}" imported successfully to DB!`);
                resetFormAndAiData();
                fetchArticles(); // Refresh list
            }
        } else if (session?.user) { // Regular user
            const newLocalArticle: LocalStorageArticle = {
                id: crypto.randomUUID(),
                title: articleTitle,
                articleText: articleText,
                userProvidedTranslation: userProvidedTranslation,
                sourceUrl: sourceUrl,
                aiProcessedData: editableAiData,
                createdAt: new Date().toISOString(),
            };
            const existingArticlesRaw = localStorage.getItem('userArticles');
            const existingArticles: LocalStorageArticle[] = existingArticlesRaw ? JSON.parse(existingArticlesRaw) : [];
            localStorage.setItem('userArticles', JSON.stringify([...existingArticles, newLocalArticle]));
            setSuccessMessage(`Article "${newLocalArticle.title}" saved locally!`);
            resetFormAndAiData();
            fetchArticles(); // Refresh list
        } else {
            setError("User session not found. Please log in.");
        }
    } catch (e) {
        console.error("Import error:", e);
        setError("An unexpected error occurred during import.");
    } finally {
        setIsLoadingImport(false);
    }
  };

  const resetFormAndAiData = () => {
    setArticleTitle('');
    setArticleText('');
    setUserProvidedTranslation('');
    setSourceUrl('');
    setMaxNewWords(10);
    setMaxPhrases(5);
    setGenerateQuestions(true);
    setEditableAiData(null);
    setIsImportButtonEnabled(false);
  };

  // --- Render ---
  if (sessionStatus === 'loading') {
    return <div className="container mx-auto p-4 flex justify-center items-center h-screen"><ReloadIcon className="mr-2 h-8 w-8 animate-spin" /> Loading session...</div>;
  }
  if (sessionStatus === 'unauthenticated') {
    return <div className="container mx-auto p-4">Please log in to access the article repository.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Article Repository</h1>
        <p className="text-muted-foreground">
          Import new articles, process them with AI, and manage your collection.
        </p>
      </header>

      {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {successMessage && <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700"><AlertTitle>Success</AlertTitle><AlertDescription>{successMessage}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Import New Article</CardTitle>
          <CardDescription>Provide article details, process with AI, then review and import.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="articleTitle">Article Title (Required for Import)</Label>
            <Input id="articleTitle" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Enter a title for this article" />
          </div>
          <div>
            <Label htmlFor="articleText">Article Text (Required for AI Processing)</Label>
            <Textarea id="articleText" value={articleText} onChange={(e) => setArticleText(e.target.value)} placeholder="Paste the full article text here..." rows={10} required />
          </div>
          <div>
            <Label htmlFor="userProvidedTranslation">User-provided Translation (Optional)</Label>
            <Textarea id="userProvidedTranslation" value={userProvidedTranslation} onChange={(e) => setUserProvidedTranslation(e.target.value)} placeholder="If you have a translation..." rows={3} />
          </div>
          <div>
            <Label htmlFor="sourceUrl">Source URL (Optional)</Label>
            <Input id="sourceUrl" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/article" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxNewWords">Max New Words for AI (default 10)</Label>
              <Input id="maxNewWords" type="number" value={maxNewWords} onChange={(e) => setMaxNewWords(parseInt(e.target.value, 10) || 10)} />
            </div>
            <div>
              <Label htmlFor="maxPhrases">Max Phrases for AI (default 5)</Label>
              <Input id="maxPhrases" type="number" value={maxPhrases} onChange={(e) => setMaxPhrases(parseInt(e.target.value, 10) || 5)} />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="generateQuestions" checked={generateQuestions} onCheckedChange={(checked) => setGenerateQuestions(Boolean(checked))} />
            <Label htmlFor="generateQuestions" className="font-medium">Generate Reading Comprehension Questions with AI</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-start">
          <Button onClick={handleProcessArticle} disabled={isLoadingAi || !articleText.trim()}>
            {isLoadingAi && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingAi ? 'Processing with AI...' : 'Process Article with AI'}
          </Button>
        </CardFooter>
      </Card>

      {editableAiData && (
        <Card>
          <CardHeader>
            <CardTitle>AI Processed Content - Review & Edit</CardTitle>
            <CardDescription>Review and edit the AI-generated content below before importing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="aiTranslation" className="text-lg font-semibold block mb-1">AI-Generated Translation</Label>
              <Textarea id="aiTranslation" value={editableAiData.translation} onChange={handleAiTranslationChange} rows={5} className="mt-1 bg-background border-border" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">AI-Extracted New Words</h3>
              {editableAiData.newWords.length > 0 ? (
                <div className="space-y-2">
                  {editableAiData.newWords.map((word, index) => (
                    <Card key={`word-${index}`} className="bg-muted/20">
                      <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <Input value={word.word} onChange={(e) => handleNewWordChange(index, 'word', e.target.value)} placeholder="Word" aria-label={`Word ${index + 1}`} />
                        <Input value={word.translation} onChange={(e) => handleNewWordChange(index, 'translation', e.target.value)} placeholder="Translation" aria-label={`Translation for word ${index + 1}`} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No new words extracted by AI.</p>}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">AI-Extracted Phrases</h3>
              {editableAiData.phrases.length > 0 ? (
                <div className="space-y-2">
                  {editableAiData.phrases.map((phrase, index) => (
                    <Card key={`phrase-${index}`} className="bg-muted/20">
                      <CardContent className="p-3 space-y-1">
                        <Input value={phrase.phrase} onChange={(e) => handlePhraseChange(index, 'phrase', e.target.value)} placeholder="Phrase" aria-label={`Phrase ${index + 1}`} />
                        <Input value={phrase.translation} onChange={(e) => handlePhraseChange(index, 'translation', e.target.value)} placeholder="Translation" aria-label={`Translation for phrase ${index + 1}`}/>
                        <Textarea value={phrase.example || ''} onChange={(e) => handlePhraseChange(index, 'example', e.target.value)} placeholder="Example sentence" rows={2} aria-label={`Example for phrase ${index + 1}`}/>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No phrases extracted by AI.</p>}
            </div>

            {generateQuestions && editableAiData.readingComprehensionQuestions && (
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Generated Reading Comprehension Questions</h3>
                {editableAiData.readingComprehensionQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {editableAiData.readingComprehensionQuestions.map((q, qIndex) => (
                      <Card key={`q-${qIndex}`} className="bg-muted/20">
                        <CardHeader>
                           <Label className="font-medium mb-1">Question {qIndex+1}</Label>
                          <Textarea value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} placeholder="Question text" rows={2} aria-label={`Question ${qIndex + 1}`}/>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Label className="font-medium">Options (Mark one as correct):</Label>
                          {q.options.map((opt, oIndex) => (
                            <div key={`q${qIndex}-opt${oIndex}`} className="flex items-center space-x-3 p-2 border rounded-md bg-background">
                              <Checkbox checked={opt.is_correct} onCheckedChange={(checked) => handleOptionChange(qIndex, oIndex, 'is_correct', Boolean(checked))} id={`q${qIndex}-opt${oIndex}-correct`} aria-label={`Correct option for question ${qIndex + 1}, option ${oIndex + 1}`}/>
                              <Input value={opt.option_text} onChange={(e) => handleOptionChange(qIndex, oIndex, 'option_text', e.target.value)} placeholder={`Option ${oIndex + 1}`} className="flex-grow" aria-label={`Option text for question ${qIndex + 1}, option ${oIndex + 1}`} />
                            </div>
                          ))}
                          <div>
                            <Label className="font-medium">Explanation:</Label>
                            <Textarea value={q.explanation} onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)} placeholder="Explanation for the correct answer" rows={2} aria-label={`Explanation for question ${qIndex + 1}`}/>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No reading comprehension questions generated by AI.</p>}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button onClick={handleImportArticle} disabled={isLoadingImport || !isImportButtonEnabled || !articleTitle.trim()} size="lg">
              {isLoadingImport && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              {isLoadingImport ? 'Importing...' : 'Import Article'}
            </Button>
          </CardFooter>
        </Card>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          {session?.user?.role === 'admin' ? 'Article Library (Admin View)' : 'Your Saved Articles'}
        </h2>
        {isLoadingArticles ? (
          <div className="flex items-center"><ReloadIcon className="mr-2 h-5 w-5 animate-spin" /> Loading articles...</div>
        ) : articlesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articlesList.map((article) => (
              <Card key={(article as any).article_id || (article as LocalStorageArticle).id}>
                <CardHeader>
                  <CardTitle className="truncate">{article.title}</CardTitle>
                  {(article as any).source_url && <CardDescription className="truncate">{(article as any).source_url}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date((article as any).created_at || (article as LocalStorageArticle).createdAt).toLocaleDateString()}
                  </p>
                   {(article as any).status && <p className="text-sm">Status: {(article as any).status}</p>}
                </CardContent>
                <CardFooter>
                  {/* Placeholder for future Edit/Delete buttons */}
                  <Button variant="outline" size="sm" disabled>View Details (Soon)</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No articles found.</p>
        )}
      </section>
    </div>
  );
}
